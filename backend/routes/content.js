const express = require('express');
const Content = require('../models/Content');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all content with filters
router.get('/', async (req, res) => {
  try {
    const { type, genre, limit = 20, page = 1, sort = 'rating' } = req.query;
    const query = {};

    if (type) query.type = type;
    if (genre) query.genre = { $in: Array.isArray(genre) ? genre : [genre] };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};

    switch (sort) {
      case 'rating':
        sortOptions.rating = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'year':
        sortOptions.year = -1;
        break;
      default:
        sortOptions.rating = -1;
    }

    const contents = await Content.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Content.countDocuments(query);

    res.json({
      contents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get content by ID
router.get('/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create content (admin - for manual additions)
router.post('/', auth, async (req, res) => {
  try {
    const content = new Content(req.body);
    await content.save();
    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get content by type
router.get('/type/:type', async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contents = await Content.find({ type: req.params.type })
      .sort({ rating: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Content.countDocuments({ type: req.params.type });

    res.json({
      contents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;



