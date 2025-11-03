const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/multirec';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    console.log('🔍 Finding and removing duplicates...\n');
    
    const db = mongoose.connection.db;
    const contents = db.collection('contents');
    
    // Get all documents
    const allDocs = await contents.find({}).toArray();
    console.log(`Total documents: ${allDocs.length}`);
    
    // Group by type, title, and description (to identify duplicates)
    const seen = new Map();
    const duplicates = [];
    
    for (const doc of allDocs) {
      // Create a key based on type, title, and year (or description)
      const key = `${doc.type}_${doc.title}_${doc.year || ''}_${doc.description?.substring(0, 50) || ''}`;
      
      if (seen.has(key)) {
        duplicates.push(doc._id);
      } else {
        seen.set(key, doc._id);
      }
    }
    
    console.log(`\n📊 Found ${duplicates.length} duplicate documents`);
    
    if (duplicates.length > 0) {
      console.log('🗑️  Removing duplicates...\n');
      
      // Remove duplicates
      const result = await contents.deleteMany({ _id: { $in: duplicates } });
      
      console.log(`✅ Removed ${result.deletedCount} duplicate documents`);
      
      // Count remaining documents by type
      const movies = await contents.countDocuments({ type: 'movie' });
      const songs = await contents.countDocuments({ type: 'song' });
      const books = await contents.countDocuments({ type: 'book' });
      
      console.log('\n📊 Remaining documents:');
      console.log(`   Movies: ${movies}`);
      console.log(`   Songs: ${songs}`);
      console.log(`   Books: ${books}`);
      console.log(`   Total: ${movies + songs + books}`);
    } else {
      console.log('✅ No duplicates found!');
    }
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });



