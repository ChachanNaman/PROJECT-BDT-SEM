const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Content = require('../models/Content');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload and parse CSV file
router.post('/csv', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { contentType } = req.body; // 'movie', 'song', or 'book'
    if (!contentType || !['movie', 'song', 'book'].includes(contentType)) {
      return res.status(400).json({ message: 'Invalid content type. Must be movie, song, or book' });
    }

    const results = [];
    const filePath = req.file.path;

    // Parse CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        try {
          const contents = [];

          for (const row of results) {
            const contentData = {
              type: contentType,
              title: row.title || row.name || row.Title || row.Name || row.track_name || row.original_title || '',
              description: row.description || row.overview || row.Description || row.Overview || '',
              genre: parseGenres(row.genre || row.genres || row.Genre || row.Genres),
              year: parseInt(row.year || row.Year || row.release_year || row.releaseYear || row.publication_date?.split('/')[2] || row.publication_date?.split('-')[0]) || null,
              rating: parseFloat(row.rating || row.Rating || row.avg_rating || row.averageRating || row.vote_average || row.average_rating) || 0,
              ratingCount: parseInt(row.ratingCount || row.rating_count || row.vote_count || row.ratings_count) || 0,
              imageUrl: row.imageUrl || row.image_url || row.poster || row.poster_path || '',
              externalId: row.id || row._id || row.movieId || row.songId || row.bookId || row.bookID || row.track_id || ''
            };

            // Type-specific fields
            if (contentType === 'movie') {
              contentData.director = row.director || row.Director || '';
              contentData.duration = parseInt(row.duration || row.runtime) || null;
            } else if (contentType === 'song') {
              contentData.artist = row.artist || row.Artist || row.artist_name || '';
              // Spotify uses duration_ms, convert to seconds
              const durationMs = parseInt(row.duration_ms || row.duration);
              contentData.duration = durationMs ? Math.floor(durationMs / 1000) : null;
            } else if (contentType === 'book') {
              // Handle authors field (can be comma-separated or single author)
              const authors = row.author || row.Author || row.author_name || row.authors || '';
              contentData.author = authors.split('/')[0].trim(); // Take first author if multiple
            }

            // Extract year from various date formats
            if (!contentData.year) {
              if (row.release_date) {
                const dateMatch = row.release_date.match(/(\d{4})/);
                if (dateMatch) contentData.year = parseInt(dateMatch[1]);
              }
              if (row.publication_date) {
                const dateMatch = row.publication_date.match(/(\d{4})/);
                if (dateMatch) contentData.year = parseInt(dateMatch[1]);
              }
            }
            
            // Store all other fields in metadata
            const metadata = { ...row };
            delete metadata.title;
            delete metadata.name;
            delete metadata.track_name;
            delete metadata.original_title;
            delete metadata.description;
            delete metadata.overview;
            delete metadata.genre;
            delete metadata.genres;
            delete metadata.year;
            delete metadata.release_year;
            delete metadata.releaseYear;
            delete metadata.publication_date;
            delete metadata.rating;
            delete metadata.vote_average;
            delete metadata.average_rating;
            delete metadata.director;
            delete metadata.artist;
            delete metadata.artist_name;
            delete metadata.author;
            delete metadata.authors;
            contentData.metadata = metadata;

            contents.push(contentData);
          }

          // Insert into database
          const inserted = await Content.insertMany(contents, { ordered: false });

          // Clean up uploaded file
          fs.unlinkSync(filePath);

          res.json({
            message: `Successfully imported ${inserted.length} ${contentType} items`,
            count: inserted.length
          });
        } catch (error) {
          // Clean up uploaded file on error
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          res.status(500).json({ message: error.message });
        }
      })
      .on('error', (error) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        res.status(500).json({ message: 'Error parsing CSV file: ' + error.message });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to parse genres
function parseGenres(genreString) {
  if (!genreString) return [];
  if (Array.isArray(genreString)) return genreString;
  
  // Handle pipe-separated, comma-separated, or JSON array strings
  if (typeof genreString === 'string') {
    if (genreString.startsWith('[')) {
      try {
        return JSON.parse(genreString);
      } catch (e) {
        // If JSON parsing fails, fall through to string splitting
      }
    }
    return genreString.split(/[|,]/).map(g => g.trim()).filter(g => g);
  }
  
  return [];
}

module.exports = router;

