const express = require('express');
const Rating = require('../models/Rating');
const Content = require('../models/Content');
const auth = require('../middleware/auth');
const router = express.Router();

// Add or update rating
router.post('/', auth, async (req, res) => {
  try {
    const { contentId, rating } = req.body;

    if (!contentId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating data' });
    }

    // Convert string ID to ObjectId if needed
    const mongoose = require('mongoose');
    let contentObjId;
    try {
      contentObjId = mongoose.Types.ObjectId.isValid(contentId) 
        ? new mongoose.Types.ObjectId(contentId) 
        : contentId;
    } catch (e) {
      contentObjId = contentId;
    }

    // Check if content exists
    const content = await Content.findById(contentObjId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Create or update rating
    let userRating = await Rating.findOne({
      userId: req.user._id,
      contentId: contentObjId
    });

    if (userRating) {
      userRating.rating = rating;
      await userRating.save();
    } else {
      userRating = new Rating({
        userId: req.user._id,
        contentId: contentObjId,
        rating
      });
      await userRating.save();
    }

    // Update content average rating
    const ratings = await Rating.find({ contentId: contentObjId });
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await Content.findByIdAndUpdate(contentObjId, {
      rating: avgRating,
      ratingCount: ratings.length
    });

    res.json(userRating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's ratings
router.get('/user', auth, async (req, res) => {
  try {
    const ratings = await Rating.find({ userId: req.user._id })
      .populate('contentId')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get rating for specific content
router.get('/content/:contentId', auth, async (req, res) => {
  try {
    // Convert string ID to ObjectId if needed
    const mongoose = require('mongoose');
    let contentObjId;
    try {
      contentObjId = mongoose.Types.ObjectId.isValid(req.params.contentId) 
        ? new mongoose.Types.ObjectId(req.params.contentId) 
        : req.params.contentId;
    } catch (e) {
      contentObjId = req.params.contentId;
    }

    const rating = await Rating.findOne({
      userId: req.user._id,
      contentId: contentObjId
    });

    if (!rating) {
      return res.json({ rating: null });
    }

    res.json(rating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

