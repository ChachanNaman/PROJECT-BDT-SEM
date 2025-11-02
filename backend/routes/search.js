const express = require('express');
const Content = require('../models/Content');
const router = express.Router();

// Search content
router.get('/', async (req, res) => {
  try {
    const { q, type, genre, limit = 20 } = req.query;

    const query = {};

    if (type) query.type = type;
    if (genre) query.genre = { $in: Array.isArray(genre) ? genre : [genre] };

    if (q) {
      query.$text = { $search: q };
    }

    const contents = await Content.find(query)
      .limit(parseInt(limit))
      .sort(q ? { score: { $meta: 'textScore' } } : { rating: -1 });

    res.json(contents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

