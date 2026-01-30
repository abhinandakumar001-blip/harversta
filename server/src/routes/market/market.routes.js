import express from 'express';

const router = express.Router();

const MARKET_DATA = [
    { crop: "Onion Big", base_price: 33, retail_range: "40 - 50", unit: "1kg" },
    { crop: "Onion Small", base_price: 50, retail_range: "60 - 75", unit: "1kg" },
    { crop: "Tomato", base_price: 25, retail_range: "30 - 38", unit: "1kg" },
    { crop: "Green Chilli", base_price: 48, retail_range: "58 - 72", unit: "1kg" },
    { crop: "Beetroot", base_price: 34, retail_range: "41 - 51", unit: "1kg" },
    { crop: "Potato", base_price: 30, retail_range: "36 - 45", unit: "1kg" },
    { crop: "Raw Banana (Plantain)", base_price: 12, retail_range: "14 - 18", unit: "1kg" },
    { crop: "Amaranth Leaves", base_price: 12, retail_range: "14 - 18", unit: "1kg" },
    { crop: "Amla", base_price: 95, retail_range: "114 - 143", unit: "1kg" },
    { crop: "Ash gourd", base_price: 18, retail_range: "22 - 27", unit: "1kg" },
    { crop: "Baby Corn", base_price: 50, retail_range: "60 - 75", unit: "1kg" },
    { crop: "Banana Flower", base_price: 14, retail_range: "17 - 21", unit: "1kg" },
    { crop: "Capsicum", base_price: 50, retail_range: "60 - 75", unit: "1kg" },
    { crop: "Bitter Gourd", base_price: 40, retail_range: "48 - 60", unit: "1kg" },
    { crop: "Bottle Gourd", base_price: 34, retail_range: "41 - 51", unit: "1kg" },
    { crop: "Butter Beans", base_price: 50, retail_range: "60 - 75", unit: "1kg" },
    { crop: "Broad Beans", base_price: 42, retail_range: "50 - 63", unit: "1kg" },
    { crop: "Cabbage", base_price: 30, retail_range: "36 - 45", unit: "1kg" },
    { crop: "Carrot", base_price: 38, retail_range: "46 - 57", unit: "1kg" },
    { crop: "Cauliflower", base_price: 26, retail_range: "31 - 39", unit: "1kg" },
    { crop: "Cluster beans", base_price: 43, retail_range: "52 - 65", unit: "1kg" },
    { crop: "Coconut", base_price: 68, retail_range: "82 - 102", unit: "1kg" },
    { crop: "Colocasia Leaves", base_price: 17, retail_range: "20 - 26", unit: "1kg" },
    { crop: "Colocasia", base_price: 30, retail_range: "36 - 45", unit: "1kg" },
    { crop: "Coriander Leaves", base_price: 13, retail_range: "16 - 20", unit: "1kg" },
    { crop: "Corn", base_price: 26, retail_range: "31 - 39", unit: "1kg" },
    { crop: "Cucumber", base_price: 25, retail_range: "30 - 38", unit: "1kg" },
    { crop: "Curry Leaves", base_price: 26, retail_range: "31 - 39", unit: "1kg" },
    { crop: "Dill Leaves", base_price: 12, retail_range: "14 - 18", unit: "1kg" },
    { crop: "Drumsticks", base_price: 160, retail_range: "192 - 240", unit: "1kg" },
    { crop: "Brinjal", base_price: 33, retail_range: "40 - 50", unit: "1kg" },
    { crop: "Brinjal (Big)", base_price: 47, retail_range: "56 - 71", unit: "1kg" },
    { crop: "Elephant Yam", base_price: 39, retail_range: "47 - 59", unit: "1kg" },
    { crop: "Fenugreek Leaves", base_price: 12, retail_range: "14 - 18", unit: "1kg" },
    { crop: "French Beans", base_price: 58, retail_range: "70 - 87", unit: "1kg" },
    { crop: "Garlic", base_price: 103, retail_range: "124 - 155", unit: "1kg" },
    { crop: "Ginger", base_price: 75, retail_range: "90 - 113", unit: "1kg" },
    { crop: "Onion Green", base_price: 39, retail_range: "47 - 59", unit: "1kg" },
    { crop: "Green Peas", base_price: 51, retail_range: "61 - 77", unit: "1kg" },
    { crop: "Ivy Gourd", base_price: 31, retail_range: "37 - 47", unit: "1kg" },
    { crop: "Lemon (Lime)", base_price: 55, retail_range: "66 - 83", unit: "1kg" },
    { crop: "Mango Raw", base_price: 40, retail_range: "48 - 60", unit: "1kg" },
    { crop: "Mint Leaves", base_price: 6, retail_range: "7 - 9", unit: "1kg" },
    { crop: "Mushroom", base_price: 94, retail_range: "113 - 141", unit: "1kg" },
    { crop: "Mustard Leaves", base_price: 12, retail_range: "14 - 18", unit: "1kg" },
    { crop: "Ladies Finger", base_price: 39, retail_range: "47 - 59", unit: "1kg" },
    { crop: "Pumpkin", base_price: 23, retail_range: "28 - 35", unit: "1kg" },
    { crop: "Radish", base_price: 35, retail_range: "42 - 53", unit: "1kg" },
    { crop: "Ridge Gourd", base_price: 38, retail_range: "46 - 57", unit: "1kg" },
    { crop: "Shallot (Pearl Onion)", base_price: 38, retail_range: "46 - 57", unit: "1kg" },
    { crop: "Snake Gourd", base_price: 39, retail_range: "47 - 59", unit: "1kg" },
    { crop: "Sorrel Leaves", base_price: 15, retail_range: "18 - 23", unit: "1kg" },
    { crop: "Spinach", base_price: 10, retail_range: "12 - 15", unit: "1kg" },
    { crop: "Sweet Potato", base_price: 60, retail_range: "72 - 90", unit: "1kg" }
];

// @desc    Get market price suggestion using fuzzy match
// @route   GET /api/market/prices
// @access  Public
router.get('/prices', (req, res) => {
    try {
        const { cropName } = req.query;

        if (!cropName) {
            return res.status(400).json({ message: 'Crop name is required' });
        }

        // Case insensitive match
        // Using "includes" for broader matching (e.g. "Onion" finds "Onion Big")
        // But prioritizing exact start or full match would be better.
        // Let's implement a simple best match:

        const term = cropName.toLowerCase();

        // 1. Exact match (case insensitive)
        let match = MARKET_DATA.find(item => item.crop.toLowerCase() === term);

        // 2. Starts with
        if (!match) {
            match = MARKET_DATA.find(item => item.crop.toLowerCase().startsWith(term));
        }

        // 3. Contains (find first)
        if (!match) {
            match = MARKET_DATA.find(item => item.crop.toLowerCase().includes(term));
        }

        if (match) {
            res.json({
                found: true,
                crop: match.crop,
                base_price: match.base_price,
                retail_range: match.retail_range,
                unit: match.unit
            });
        } else {
            res.json({ found: false, message: 'No market data found for this crop' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
