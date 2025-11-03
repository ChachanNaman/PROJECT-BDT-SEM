/* Run: node scripts/export_for_spark.js */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Content = require('../backend/models/Content');
const Rating = require('../backend/models/Rating');

const OUT_DIR = process.env.ANALYTICS_IN_DIR || path.resolve(__dirname, '../analytics-in');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/multirec');
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const writeJsonl = async (cursor, outFile) => {
    const ws = fs.createWriteStream(outFile);
    for await (const doc of cursor) ws.write(JSON.stringify(doc) + '\n');
    await new Promise(r => ws.end(r));
    console.log('Wrote', outFile);
  };

  await writeJsonl(Content.find().cursor(), path.join(OUT_DIR, 'content.jsonl'));
  await writeJsonl(Rating.find().cursor(), path.join(OUT_DIR, 'ratings.jsonl'));

  await mongoose.disconnect();
})();


