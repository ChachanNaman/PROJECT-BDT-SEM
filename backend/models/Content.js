const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['movie', 'song', 'book'],
    required: true
  },
  genre: [String],
  description: String,
  year: Number,
  author: String,
  director: String,
  artist: String,
  duration: Number, // For movies and songs
  rating: Number, // Average rating
  ratingCount: {
    type: Number,
    default: 0
  },
  imageUrl: String,
  externalId: String, // ID from original dataset
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better search performance
contentSchema.index({ type: 1, genre: 1 });
contentSchema.index({ title: 'text', description: 'text' });
contentSchema.index({ type: 1, rating: -1 });

module.exports = mongoose.model('Content', contentSchema);



