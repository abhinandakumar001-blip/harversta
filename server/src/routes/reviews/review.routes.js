import express from 'express';
import Review from '../../models/Review.js';
import Order from '../../models/Order.js';
import User from '../../models/User.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to check roles
const checkRole = (role) => (req, res, next) => {
    if (req.user && req.user.role === role) {
        next();
    } else {
        res.status(403).json({ message: `Not authorized as a ${role}` });
    }
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private (Buyer only)
router.post('/', protect, checkRole('buyer'), async (req, res) => {
    try {
        const { orderId, rating, comment } = req.body;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Ensure the logged in user is the buyer of the order
        if (order.buyer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to review this order' });
        }

        if (order.status !== 'delivered') {
            return res.status(400).json({ message: 'Order must be delivered to leave a review' });
        }

        // Check for existing review
        const existingReview = await Review.findOne({ order: orderId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this order' });
        }

        const review = new Review({
            farmer: order.farmer,
            buyer: req.user._id,
            order: orderId,
            rating,
            comment
        });

        await review.save();

        // Update Farmer Stats
        const farmerId = order.farmer;

        // Calculate new average
        const stats = await Review.aggregate([
            { $match: { farmer: farmerId } },
            {
                $group: {
                    _id: '$farmer',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            await User.findByIdAndUpdate(farmerId, {
                averageRating: stats[0].averageRating,
                totalReviews: stats[0].totalReviews
            });
        }

        res.status(201).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get reviews for a farmer
// @route   GET /api/reviews/farmer/:farmerId
// @access  Public
router.get('/farmer/:farmerId', async (req, res) => {
    try {
        const reviews = await Review.find({ farmer: req.params.farmerId })
            .populate('buyer', 'name')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

export default router;
