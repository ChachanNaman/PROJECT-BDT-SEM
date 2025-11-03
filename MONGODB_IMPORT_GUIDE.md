# Import CSV Files Directly to MongoDB

This guide shows you how to import your CSV files directly into MongoDB using a script or MongoDB Compass.

## Method 1: Using Import Script (Recommended)

### Step 1: Install Dependencies
```bash
cd ~/Desktop/MultiRec/backend
npm install csv-parser
```

### Step 2: Run Import Script
```bash
cd ~/Desktop/MultiRec
node import-to-mongodb.js
```

This will:
- Connect to MongoDB at `mongodb://localhost:27017/multirec`
- Import `movies.csv` from Downloads folder → type: "movie"
- Import `books.csv` from Downloads folder → type: "book"
- Import `SpotifyFeatures.csv` from Downloads folder → type: "song"
- All items go into the `contents` collection with a `type` field

### Step 3: Verify in MongoDB Compass
1. Open MongoDB Compass
2. Connect to `localhost:27017`
3. Select database: `multirec`
4. Select collection: `contents`
5. Filter by:
   - `{type: "movie"}` for movies
   - `{type: "song"}` for songs
   - `{type: "book"}` for books

## Method 2: Using MongoDB Compass Import

### Step 1: Open MongoDB Compass
1. Connect to `localhost:27017`
2. Create database: `multirec` (if doesn't exist)
3. Create collection: `contents`

### Step 2: Import Movies

1. Click on `contents` collection
2. Click "ADD DATA" → "Import File"
3. Select: `/Users/namanchachan/Downloads/movies.csv`
4. File Type: CSV
5. Click "Next"
6. **Map Columns:**
   - `title` → `title`
   - `overview` → `description`
   - `genres` → `genre` (will be parsed)
   - `release_date` → `year` (extract year)
   - `vote_average` → `rating`
   - `vote_count` → `ratingCount`
   - `director` → `director`
   - `runtime` → `duration`
7. **Add Field:**
   - Field Name: `type`
   - Field Value: `"movie"`
8. Click "Import"

### Step 3: Import Books

1. Click "ADD DATA" → "Import File"
2. Select: `/Users/namanchachan/Downloads/books.csv`
3. File Type: CSV
4. **Map Columns:**
   - `title` → `title`
   - `authors` → `author`
   - `average_rating` → `rating`
   - `ratings_count` → `ratingCount`
   - `publication_date` → `year` (extract year)
5. **Add Field:**
   - Field Name: `type`
   - Field Value: `"book"`
6. Click "Import"

### Step 4: Import Songs

1. Click "ADD DATA" → "Import File"
2. Select: `/Users/namanchachan/Downloads/SpotifyFeatures.csv`
3. File Type: CSV
4. **Map Columns:**
   - `track_name` → `title`
   - `artist_name` → `artist`
   - `genre` → `genre`
   - `duration_ms` → `duration` (divide by 1000 to get seconds)
5. **Add Field:**
   - Field Name: `type`
   - Field Value: `"song"`
6. Click "Import"

## Method 3: Using mongoimport (Command Line)

### Import Movies
```bash
mongoimport --host localhost:27017 \
  --db multirec \
  --collection contents \
  --type csv \
  --file ~/Downloads/movies.csv \
  --headerline \
  --fields title,overview,genres,release_date,vote_average,vote_count,director,runtime
```

Then update all documents to add `type: "movie"`:
```bash
mongo multirec --eval 'db.contents.updateMany({type: {$exists: false}}, {$set: {type: "movie"}})'
```

### Import Books
```bash
mongoimport --host localhost:27017 \
  --db multirec \
  --collection contents \
  --type csv \
  --file ~/Downloads/books.csv \
  --headerline
```

Update with type:
```bash
mongo multirec --eval 'db.contents.updateMany({title: {$exists: true}, type: {$exists: false}}, {$set: {type: "book"}})'
```

### Import Songs
```bash
mongoimport --host localhost:27017 \
  --db multirec \
  --collection contents \
  --type csv \
  --file ~/Downloads/SpotifyFeatures.csv \
  --headerline
```

Update with type:
```bash
mongo multirec --eval 'db.contents.updateMany({track_name: {$exists: true}}, {$set: {type: "song", title: "$track_name", artist: "$artist_name"}})'
```

## Recommended Approach

**Use Method 1 (Import Script)** - It handles all the field mapping and type conversion automatically!

## After Import

1. **Verify in MongoDB Compass:**
   - Open `multirec` database
   - Click `contents` collection
   - Filter: `{type: "movie"}` - should show movies
   - Filter: `{type: "song"}` - should show songs
   - Filter: `{type: "book"}` - should show books

2. **Verify on Website:**
   - Go to `http://localhost:3000`
   - Login to your account
   - Click "Movies" - should show movies
   - Click "Songs" - should show songs
   - Click "Books" - should show books

## Troubleshooting

### Script Not Found
Make sure you're in the MultiRec directory:
```bash
cd ~/Desktop/MultiRec
node import-to-mongodb.js
```

### MongoDB Not Running
Start MongoDB:
```bash
brew services start mongodb-community
# Or manually:
mongod
```

### Collection Already Has Data
The script will skip duplicates. To start fresh:
```bash
mongo multirec --eval 'db.contents.deleteMany({})'
```

## Notes

- All data goes into the same `contents` collection
- Each document has a `type` field: `"movie"`, `"song"`, or `"book"`
- The website automatically filters by `type`
- You can have separate collections if you prefer (books, movies, songs)



