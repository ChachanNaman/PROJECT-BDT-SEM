const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/multirec';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    return importCSVFiles();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Content Schema
const contentSchema = new mongoose.Schema({}, { strict: false });
const Content = mongoose.model('Content', contentSchema);

// Helper function to parse genres
function parseGenres(genreString) {
  if (!genreString) return [];
  if (Array.isArray(genreString)) return genreString;
  
  if (typeof genreString === 'string') {
    // Handle space-separated genres (like "Action Adventure Fantasy")
    if (genreString.includes(' ')) {
      return genreString.split(/\s+/).filter(g => g);
    }
    // Handle comma-separated
    if (genreString.includes(',')) {
      return genreString.split(',').map(g => g.trim()).filter(g => g);
    }
    // Handle pipe-separated
    if (genreString.includes('|')) {
      return genreString.split('|').map(g => g.trim()).filter(g => g);
    }
    // Single genre
    return [genreString.trim()];
  }
  
  return [];
}

// Helper function to extract year from date
function extractYear(dateString) {
  if (!dateString) return null;
  const match = dateString.match(/(\d{4})/);
  return match ? parseInt(match[1]) : null;
}

async function importCSVFile(filePath, contentType) {
  console.log(`\n📄 Processing ${contentType} file: ${path.basename(filePath)}`);
  
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const contentData = {
            type: contentType,
            title: row.title || row.name || row.Title || row.Name || row.track_name || row.original_title || '',
            description: row.description || row.overview || row.Description || row.Overview || '',
            genre: parseGenres(row.genre || row.genres || row.Genre || row.Genres),
            year: parseInt(row.year || row.Year || row.release_year || row.releaseYear) || extractYear(row.publication_date || row.release_date),
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
            const authors = row.author || row.Author || row.author_name || row.authors || '';
            contentData.author = authors.split('/')[0].trim(); // Take first author if multiple
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
          delete metadata.release_date;
          delete metadata.rating;
          delete metadata.vote_average;
          delete metadata.average_rating;
          delete metadata.director;
          delete metadata.artist;
          delete metadata.artist_name;
          delete metadata.author;
          delete metadata.authors;
          contentData.metadata = metadata;

          if (contentData.title) {
            results.push(contentData);
          } else {
            errors.push('Missing title field');
          }
        } catch (error) {
          errors.push(error.message);
        }
      })
      .on('end', async () => {
        if (results.length === 0) {
          console.log(`⚠️  No valid records found in ${path.basename(filePath)}`);
          return resolve(0);
        }

        try {
          console.log(`📊 Importing ${results.length} ${contentType} items...`);
          
          // Insert in batches of 1000
          const batchSize = 1000;
          let inserted = 0;
          
          for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            try {
              await Content.insertMany(batch, { ordered: false });
              inserted += batch.length;
              console.log(`   ✓ Inserted ${inserted}/${results.length} items...`);
            } catch (error) {
              console.log(`   ⚠️  Some items in batch failed (duplicates or errors), continuing...`);
            }
          }
          
          console.log(`✅ Successfully imported ${inserted} ${contentType} items!`);
          if (errors.length > 0) {
            console.log(`⚠️  ${errors.length} errors encountered (skipped)`);
          }
          resolve(inserted);
        } catch (error) {
          console.error(`❌ Error importing ${contentType}:`, error.message);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error(`❌ Error reading ${filePath}:`, error.message);
        reject(error);
      });
  });
}

async function importCSVFiles() {
  const downloadsPath = path.join(require('os').homedir(), 'Downloads');
  
  // Check for alternative filenames
  const spotifyFile = fs.existsSync(path.join(downloadsPath, 'SpotifyFeatures.csv'))
    ? path.join(downloadsPath, 'SpotifyFeatures.csv')
    : fs.existsSync(path.join(downloadsPath, 'songs.csv'))
    ? path.join(downloadsPath, 'songs.csv')
    : path.join(downloadsPath, 'SpotifyFeatures.csv');
  
  const files = [
    { path: path.join(downloadsPath, 'movies.csv'), type: 'movie' },
    { path: path.join(downloadsPath, 'books.csv'), type: 'book' },
    { path: spotifyFile, type: 'song' }
  ];

  console.log('🚀 Starting CSV import to MongoDB...');
  console.log('=' .repeat(50));

  let totalImported = 0;

  for (const file of files) {
    if (fs.existsSync(file.path)) {
      try {
        const count = await importCSVFile(file.path, file.type);
        totalImported += count;
      } catch (error) {
        console.error(`❌ Failed to import ${file.type}:`, error.message);
      }
    } else {
      console.log(`⚠️  File not found: ${file.path}`);
    }
  }

  console.log('='.repeat(50));
  console.log(`\n✅ Import complete! Total items imported: ${totalImported}`);
  console.log('\n📌 You can now view the data in:');
  console.log('   - MongoDB Compass: Filter by {type: "movie"}, {type: "song"}, {type: "book"}');
  console.log('   - Website: Movies/Songs/Books pages\n');
  
  mongoose.connection.close();
  process.exit(0);
}

