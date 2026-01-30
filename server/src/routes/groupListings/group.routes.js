import express from 'express';
import Product from '../../models/Product.js';
import GroupListing from '../../models/GroupListing.js';
import Order from '../../models/Order.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to ensure user is a farmer
const isFarmer = (req, res, next) => {
    if (req.user && req.user.role === 'farmer') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a farmer' });
    }
};

const isBuyer = (req, res, next) => {
    if (req.user && req.user.role === 'buyer') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a buyer' });
    }
};

// @desc    Join a group listing (Farmer opts in)
// @route   POST /api/group-listings/join
// @access  Private (Farmer only)
router.post('/join', protect, isFarmer, async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.farmer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Find or create group listing for this crop and location
        // Using regex for case-insensitive exact match
        let group = await GroupListing.findOne({
            cropName: { $regex: new RegExp(`^${product.cropName}$`, 'i') },
            location: { $regex: new RegExp(`^${product.location}$`, 'i') }
        });

        if (!group) {
            group = new GroupListing({
                cropName: product.cropName,
                location: product.location,
                pricePerKg: product.pricePerKg, // Start with this price. In real world, price logic is complex.
                farmers: []
            });
        }

        // Check if already in group
        const exists = group.farmers.find(f => f.product.toString() === productId);
        if (exists) {
            return res.status(400).json({ message: 'Already in a group' });
        }

        // Add farmer to group
        group.farmers.push({
            farmer: req.user._id,
            product: productId,
            quantityKg: product.quantityKg
        });

        // Recalculate total
        group.totalQuantityKg = group.farmers.reduce((sum, f) => sum + f.quantityKg, 0);

        // Update price logic: keep lowest or average? Let's use MIN price to be competitive
        // or just keep original. Let's strictly enforce uniformity for now or just average. 
        // Simple: use the price of the first product or last?
        // Let's adopt a "Average Price" for simplicity of "Group Selling".
        const totalVal = group.farmers.reduce((sum, f) => sum + (f.quantityKg * product.pricePerKg), 0); // Warning: this assumes all have same price?
        // Actually, we should fetch all product prices. But `farmers` array only has IDs.
        // Let's simplify: Set group price to be the newly added product's price if it's new, 
        // or re-calculate average. 
        // BETTER: Set price to the minimum of all farmers to attract buyers.
        // But for MVP, let's just assume homogenous crops have similar market price in location.
        // We will stick to the existing group price unless it's a new group.

        await group.save();

        // Mark product as group eligible/joined
        product.isGroupEligible = true;
        await product.save();

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get all active group listings
// @route   GET /api/group-listings
// @access  Private (Buyer only - or public/protected)
router.get('/', protect, async (req, res) => {
    try {
        const groups = await GroupListing.find({ isActive: true, totalQuantityKg: { $gt: 0 } })
            .sort({ createdAt: -1 });
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Place Bulk Order
// @route   POST /api/group-listings/order
// @access  Private (Buyer only)
router.post('/order', protect, isBuyer, async (req, res) => {
    try {
        const { groupId, quantityKg } = req.body;
        const group = await GroupListing.findById(groupId).populate('farmers.product');

        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (group.totalQuantityKg < quantityKg) return res.status(400).json({ message: 'Insufficient quantity in group' });

        const pricePerKg = group.pricePerKg;
        const totalPrice = pricePerKg * quantityKg;

        // Split logic: Proportional distribution
        // Warning: This is a simplifed distribution. 
        // We iterate and deduct from each farmer proportionally or FIFO.
        // Let's use FIFO (First In First Out) or Proportional? 
        // Proportional is fairer but harder if discrete units. 
        // Let's do Proportional float based, rounding down.

        let remainingToFulfill = quantityKg;
        const subOrders = [];

        // Calculate proportions based on current contribution
        const initialTotal = group.totalQuantityKg;

        // We need to loop and create individual orders for farmers
        for (let i = 0; i < group.farmers.length; i++) {
            if (remainingToFulfill <= 0) break;

            const farmerEntry = group.farmers[i];
            const contribution = farmerEntry.quantityKg;

            // Amount this farmer fulfills
            // Ratio = contribution / initialTotal
            // But we simply can just take what is needed.
            // Let's try to take proportionally: (contribution / initialTotal) * quantityKg
            let amountFromFarmer = Math.floor((contribution / initialTotal) * quantityKg);

            // Adjust for last one or rounding errors
            if (i === group.farmers.length - 1) {
                amountFromFarmer = remainingToFulfill; // Dump rest
            } else if (amountFromFarmer > remainingToFulfill) {
                amountFromFarmer = remainingToFulfill;
            }
            // Also cap at what they have
            if (amountFromFarmer > contribution) amountFromFarmer = contribution;

            if (amountFromFarmer > 0) {
                // Create sub-order
                const subOrder = new Order({
                    buyer: req.user._id,
                    farmer: farmerEntry.farmer,
                    product: farmerEntry.product._id,
                    quantityKg: amountFromFarmer,
                    pricePerKg: pricePerKg,
                    totalPrice: amountFromFarmer * pricePerKg,
                    status: 'pending' // or 'accepted'?
                });
                await subOrder.save();

                // Update farmer product stock
                const product = await Product.findById(farmerEntry.product._id);
                product.quantityKg -= amountFromFarmer;
                await product.save();

                // Update group entry
                farmerEntry.quantityKg -= amountFromFarmer;
                remainingToFulfill -= amountFromFarmer;
            }
        }

        // Recalculate group total
        group.totalQuantityKg = group.farmers.reduce((sum, f) => sum + f.quantityKg, 0);
        await group.save();

        res.json({ message: 'Bulk order placed and distributed', subOrders });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});


// @desc    Get groups where the farmer has joined
// @route   GET /api/group-listings/my-groups
// @access  Private (Farmer only)
router.get('/my-groups', protect, isFarmer, async (req, res) => {
    try {
        const groups = await GroupListing.find({ 'farmers.farmer': req.user._id })
            .populate('farmers.product'); // Populate to show details if needed
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Leave a group listing
// @route   POST /api/group-listings/leave
// @access  Private (Farmer only)
router.post('/leave', protect, isFarmer, async (req, res) => {
    try {
        const { productId } = req.body;

        // Find the group containing this product
        const group = await GroupListing.findOne({ 'farmers.product': productId });

        if (!group) {
            return res.status(404).json({ message: 'Group not found or not in a group' });
        }

        // Remove the farmer/product entry
        const originalLength = group.farmers.length;
        group.farmers = group.farmers.filter(f => f.product.toString() !== productId);

        if (group.farmers.length === originalLength) {
            return res.status(400).json({ message: 'Product not found in this group' });
        }

        // Recalculate total quantity
        group.totalQuantityKg = group.farmers.reduce((sum, f) => sum + f.quantityKg, 0);

        // If no farmers left, mark inactive or delete? 
        // Let's mark inactive if 0 quantity, or just keep it empty?
        // Usually, if empty, we might want to clean it up, but for now just 0 qty is fine.
        if (group.farmers.length === 0) {
            group.totalQuantityKg = 0;
            // Optional: group.isActive = false;
        }

        await group.save();

        // Update product status
        const product = await Product.findById(productId);
        if (product) {
            product.isGroupEligible = false;
            await product.save();
        }

        res.json({ message: 'Left group successfully', group });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

export default router;
