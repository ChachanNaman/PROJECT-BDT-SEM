const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/multirec';

// Function to convert document to CSV row
function documentToCSVRow(doc) {
  const fields = [
    doc._id?.toString() || '',
    doc.type || '',
    doc.title || '',
    doc.description || '',
    doc.year || '',
    doc.rating || '',
    doc.ratingCount || '',
    Array.isArray(doc.genre) ? doc.genre.join(', ') : doc.genre || '',
    doc.director || doc.artist || doc.author || '',
    doc.duration || '',
    doc.externalId || ''
  ];
  
  // Escape commas and quotes in fields
  return fields.map(field => {
    const str = String(field || '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }).join(',');
}

async function exportToCSV() {
  console.log('🚀 Starting data export for Power BI...\n');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const contents = db.collection('contents');
    
    // CSV Headers
    const headers = [
      '_id',
      'type',
      'title',
      'description',
      'year',
      'rating',
      'ratingCount',
      'genre',
      'director_artist_author',
      'duration',
      'externalId'
    ];
    
    const headerRow = headers.join(',');
    
    // Export all content
    console.log('📊 Exporting all content...');
    const allDocs = await contents.find({}).toArray();
    const allContentCSV = [headerRow, ...allDocs.map(doc => documentToCSVRow(doc))].join('\n');
    fs.writeFileSync(path.join(__dirname, 'all_content_export.csv'), allContentCSV);
    console.log(`   ✅ Exported ${allDocs.length} items to all_content_export.csv`);
    
    // Export movies
    console.log('\n🎬 Exporting movies...');
    const movies = await contents.find({ type: 'movie' }).toArray();
    const moviesCSV = [headerRow, ...movies.map(doc => documentToCSVRow(doc))].join('\n');
    fs.writeFileSync(path.join(__dirname, 'movies_export.csv'), moviesCSV);
    console.log(`   ✅ Exported ${movies.length} movies to movies_export.csv`);
    
    // Export songs
    console.log('\n🎵 Exporting songs...');
    const songs = await contents.find({ type: 'song' }).toArray();
    const songsCSV = [headerRow, ...songs.map(doc => documentToCSVRow(doc))].join('\n');
    fs.writeFileSync(path.join(__dirname, 'songs_export.csv'), songsCSV);
    console.log(`   ✅ Exported ${songs.length} songs to songs_export.csv`);
    
    // Export books
    console.log('\n📚 Exporting books...');
    const books = await contents.find({ type: 'book' }).toArray();
    const booksCSV = [headerRow, ...books.map(doc => documentToCSVRow(doc))].join('\n');
    fs.writeFileSync(path.join(__dirname, 'books_export.csv'), booksCSV);
    console.log(`   ✅ Exported ${books.length} books to books_export.csv`);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Export complete!');
    console.log('='.repeat(50));
    console.log('\n📁 Files created:');
    console.log('   - all_content_export.csv');
    console.log('   - movies_export.csv');
    console.log('   - songs_export.csv');
    console.log('   - books_export.csv');
    console.log('\n📍 Location:', __dirname);
    console.log('\n💡 Next steps:');
    console.log('   1. Import CSV files into Power BI or Google Data Studio');
    console.log('   2. Create visualizations');
    console.log('   3. Get embed URL and add to website\n');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

exportToCSV();



