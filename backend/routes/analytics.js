const express = require('express');
const Content = require('../models/Content');
const Rating = require('../models/Rating');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// GET /api/analytics/counts-by-type
router.get('/counts-by-type', async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $project: { _id: 0, type: '$_id', count: 1 } },
      { $sort: { type: 1 } }
    ];
    const results = await Content.aggregate(pipeline);
    res.json({ data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/avg-rating-by-genre?type=movie|song|book&limit=10
router.get('/avg-rating-by-genre', async (req, res) => {
  try {
    const { type, limit = 10 } = req.query;
    const matchStage = {};
    if (type) matchStage.type = type;

    const pipeline = [
      { $match: matchStage },
      { $unwind: { path: '$genre', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$genre', avgRating: { $avg: { $ifNull: ['$rating', 0] } }, count: { $sum: 1 } } },
      { $project: { _id: 0, genre: '$_id', avgRating: { $round: ['$avgRating', 2] }, count: 1 } },
      { $sort: { avgRating: -1, count: -1 } },
      { $limit: parseInt(limit) }
    ];
    const results = await Content.aggregate(pipeline);
    res.json({ data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/count-by-year?type=movie|song|book
router.get('/count-by-year', async (req, res) => {
  try {
    const { type } = req.query;
    const matchStage = { year: { $ne: null } };
    if (type) matchStage.type = type;

    const pipeline = [
      { $match: matchStage },
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $project: { _id: 0, year: '$_id', count: 1 } },
      { $sort: { year: 1 } }
    ];
    const results = await Content.aggregate(pipeline);
    res.json({ data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/top-rated?type=movie|song|book&limit=10
router.get('/top-rated', async (req, res) => {
  try {
    const { type, limit = 10 } = req.query;
    const query = {};
    if (type) query.type = type;
    const items = await Content.find(query).sort({ rating: -1, ratingCount: -1 }).limit(parseInt(limit));
    res.json({ data: items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/genre-count?type=movie|song|book&limit=20
router.get('/genre-count', async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;
    const matchStage = {};
    if (type) matchStage.type = type;
    const pipeline = [
      { $match: matchStage },
      { $unwind: { path: '$genre', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $project: { _id: 0, genre: '$_id', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ];
    const results = await Content.aggregate(pipeline);
    res.json({ data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/top-authors?limit=10
router.get('/top-authors', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const pipeline = [
      { $match: { type: 'book', author: { $ne: null } } },
      { $group: { _id: '$author', count: { $sum: 1 } } },
      { $project: { _id: 0, author: '$_id', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ];
    const results = await Content.aggregate(pipeline);
    res.json({ data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/top-artists?limit=10
router.get('/top-artists', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const pipeline = [
      { $match: { type: 'song', artist: { $ne: null } } },
      { $group: { _id: '$artist', count: { $sum: 1 } } },
      { $project: { _id: 0, artist: '$_id', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ];
    const results = await Content.aggregate(pipeline);
    res.json({ data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/rating-distribution
router.get('/rating-distribution', async (_req, res) => {
  try {
    const pipeline = [
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $project: { _id: 0, rating: '$_id', count: 1 } },
      { $sort: { rating: 1 } }
    ];
    const results = await Rating.aggregate(pipeline);
    res.json({ data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/avg-rating-by-type
router.get('/avg-rating-by-type', async (_req, res) => {
  try {
    const pipeline = [
      { $group: { _id: '$type', avgRating: { $avg: { $ifNull: ['$rating', 0] } } } },
      { $project: { _id: 0, type: '$_id', avgRating: { $round: ['$avgRating', 2] } } },
      { $sort: { type: 1 } }
    ];
    const results = await Content.aggregate(pipeline);
    res.json({ data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

function readJsonDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return [];
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
    const parts = [];
    for (const f of files) {
      const full = path.join(dirPath, f);
      const raw = fs.readFileSync(full, 'utf8').trim();
      if (!raw) continue;
      const lines = raw.split('\n').filter(Boolean);
      for (const line of lines) {
        try { parts.push(JSON.parse(line)); } catch (e) { /* ignore parse errors */ }
      }
    }
    return parts;
  } catch (e) {
    return [];
  }
}

// GET /api/analytics/content-agg
router.get('/content-agg', async (req, res) => {
  try {
    const outDir = process.env.ANALYTICS_OUT_DIR || path.resolve(__dirname, '../../analytics-out/content_agg_json');
    const data = readJsonDir(outDir);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/trends
router.get('/trends', async (req, res) => {
  try {
    const outDir = process.env.ANALYTICS_OUT_DIR || path.resolve(__dirname, '../../analytics-out/content_trends_json');
    const data = readJsonDir(outDir);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/kpis
router.get('/kpis', async (req, res) => {
  try {
    const outDir = process.env.ANALYTICS_OUT_DIR || path.resolve(__dirname, '../../analytics-out/content_agg_json');
    const data = readJsonDir(outDir);
    const totalTitles = data.length;
    const avgOfAvg = data.length ? (data.reduce((s, d) => s + (d.avg_rating || 0), 0) / data.length) : 0;
    const totalRatings = data.reduce((s, d) => s + (d.rating_count || 0), 0);
    const totalRatings30d = data.reduce((s, d) => s + (d.ratings_30d || 0), 0);
    res.json({
      totalTitles,
      avgRating: Math.round(avgOfAvg * 100) / 100,
      totalRatings,
      totalRatings30d
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




