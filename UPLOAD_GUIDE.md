# How to Upload Your CSV Files to MultiRec

You have three CSV files ready:
1. **movies.csv** - Movies data (in Downloads folder)
2. **books.csv** - Books data (in Downloads folder)  
3. **SpotifyFeatures.csv** - Songs data (in Downloads folder)

## Method 1: Upload via Website (Recommended)

### Step 1: Start All Services

**Terminal 1 - Backend:**
```bash
cd ~/Desktop/MultiRec/backend
npm install
npm start
```

**Terminal 2 - ML API:**
```bash
cd ~/Desktop/MultiRec/ml-api
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

**Terminal 3 - Frontend:**
```bash
cd ~/Desktop/MultiRec/frontend
npm install
npm start
```

### Step 2: Open Website
- Navigate to `http://localhost:3000`
- Register a new account
- Login to your account

### Step 3: Upload Files

1. **Upload Movies:**
   - Click "Upload Data" in the sidebar
   - Select content type: **Movies**
   - Choose file: `/Users/namanchachan/Downloads/movies.csv`
   - Click "Upload CSV"
   - Wait for success message

2. **Upload Books:**
   - Stay on "Upload Data" page
   - Select content type: **Books**
   - Choose file: `/Users/namanchachan/Downloads/books.csv`
   - Click "Upload CSV"
   - Wait for success message

3. **Upload Songs:**
   - Stay on "Upload Data" page
   - Select content type: **Songs**
   - Choose file: `/Users/namanchachan/Downloads/SpotifyFeatures.csv`
   - Click "Upload CSV"
   - Wait for success message

**Note:** For SpotifyFeatures.csv, you may want to filter out rows where `genre="Movie"` if they're not actual songs. The system will still process them, but they might appear in songs section.

## Method 2: Import Directly via MongoDB Compass

### Step 1: Open MongoDB Compass
- Connect to `localhost:27017`
- Create/Select database: `multirec`
- Create collection: `contents`

### Step 2: Import via Compass
1. Click on `contents` collection
2. Click "Import Data" button
3. Select your CSV file
4. Map columns:
   - For **movies.csv**: Map `title`, `overview` → `description`, `genres` → `genre`, `release_date` → `year`, `vote_average` → `rating`, `vote_count` → `ratingCount`, `director`, `runtime` → `duration`
   - For **books.csv**: Map `title`, `authors` → `author`, `average_rating` → `rating`, `ratings_count` → `ratingCount`, `publication_date` → `year`
   - For **SpotifyFeatures.csv**: Map `track_name` → `title`, `artist_name` → `artist`, `genre`, `duration_ms` → `duration`

**Note:** This method requires manual column mapping and adding `type: "movie"`, `type: "song"`, or `type: "book"` to each document.

## CSV File Formats Supported

### Movies CSV
The system automatically detects:
- `title` or `original_title` → Title
- `overview` → Description
- `genres` → Genre (space-separated like "Action Adventure Fantasy")
- `release_date` → Year extracted
- `vote_average` → Rating
- `vote_count` → Rating Count
- `director` → Director
- `runtime` → Duration (minutes)

### Books CSV
The system automatically detects:
- `title` → Title
- `authors` → Author (first author if multiple)
- `average_rating` → Rating
- `ratings_count` → Rating Count
- `publication_date` → Year extracted
- `num_pages` → Stored in metadata

### Songs CSV (Spotify)
The system automatically detects:
- `track_name` → Title
- `artist_name` → Artist
- `genre` → Genre
- `duration_ms` → Duration (converted to seconds)
- `popularity` → Stored in metadata

## Verification

After uploading:

1. **Check Database:**
   - Open MongoDB Compass
   - Navigate to `multirec` database
   - Click on `contents` collection
   - You should see documents with `type: "movie"`, `type: "song"`, `type: "book"`

2. **Check Website:**
   - Go to "Movies" page - should show movies
   - Go to "Songs" page - should show songs
   - Go to "Books" page - should show books

3. **Check Counts:**
   - Dashboard should show trending items
   - Content pages should display items in cards

## Troubleshooting

### Upload Fails
- Check file size (max 10MB per upload)
- Verify CSV format is correct
- Check backend console for errors
- Ensure MongoDB is running

### Data Not Showing
- Refresh the page
- Check MongoDB connection
- Verify data exists in `contents` collection
- Check browser console for errors

### Missing Fields
- Some fields may be optional
- Check `metadata` field for all original CSV data
- Fields like `imageUrl` may be empty (default placeholder shown)

## Quick Upload Script

If you want to upload via command line, you can use curl:

```bash
# Upload Movies
curl -X POST http://localhost:5000/api/upload/csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/Users/namanchachan/Downloads/movies.csv" \
  -F "contentType=movie"

# Upload Books  
curl -X POST http://localhost:5000/api/upload/csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/Users/namanchachan/Downloads/books.csv" \
  -F "contentType=book"

# Upload Songs
curl -X POST http://localhost:5000/api/upload/csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/Users/namanchachan/Downloads/SpotifyFeatures.csv" \
  -F "contentType=song"
```

Get your token by logging in via the website first.

