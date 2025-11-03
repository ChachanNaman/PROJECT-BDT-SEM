# Quick Start Guide - Upload Your CSV Files

## Your Files
- 📁 `/Users/namanchachan/Downloads/movies.csv` - Movies data
- 📁 `/Users/namanchachan/Downloads/books.csv` - Books data
- 📁 `/Users/namanchachan/Downloads/SpotifyFeatures.csv` - Songs data

## Step-by-Step Upload Process

### 1. Install Dependencies (First Time Only)

**Backend:**
```bash
cd ~/Desktop/MultiRec/backend
npm install
```

**ML API:**
```bash
cd ~/Desktop/MultiRec/ml-api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd ~/Desktop/MultiRec/frontend
npm install
```

### 2. Setup Environment Files

**Backend `.env`:**
```bash
cd ~/Desktop/MultiRec/backend
cp .env.example .env
# Edit .env with: MONGODB_URI=mongodb://localhost:27017/multirec
```

**ML API `.env`:**
```bash
cd ~/Desktop/MultiRec/ml-api
cp .env.example .env
# Edit .env with: MONGODB_URI=mongodb://localhost:27017/multirec
```

### 3. Start MongoDB
Make sure MongoDB is running on `localhost:27017`

### 4. Start All Services

Open **3 terminal windows**:

**Terminal 1 - Backend (Port 5000):**
```bash
cd ~/Desktop/MultiRec/backend
npm start
```

**Terminal 2 - ML API (Port 8000):**
```bash
cd ~/Desktop/MultiRec/ml-api
source venv/bin/activate
python app.py
```

**Terminal 3 - Frontend (Port 3000):**
```bash
cd ~/Desktop/MultiRec/frontend
npm start
```

### 5. Upload Your CSV Files

1. **Open Browser:** `http://localhost:3000`

2. **Register Account:**
   - Click "Register"
   - Enter username, email, password
   - Select role: "User" or "Kid"
   - Click "Register"

3. **Login:**
   - Enter email and password
   - Click "Login"

4. **Upload Movies:**
   - Click "Upload Data" in sidebar
   - Select: **Movies**
   - Click "Choose File" → Select `/Users/namanchachan/Downloads/movies.csv`
   - Click "Upload CSV"
   - Wait for: "Successfully uploaded X movie items!"

5. **Upload Books:**
   - On same page, select: **Books**
   - Click "Choose File" → Select `/Users/namanchachan/Downloads/books.csv`
   - Click "Upload CSV"
   - Wait for: "Successfully uploaded X book items!"

6. **Upload Songs:**
   - On same page, select: **Songs**
   - Click "Choose File" → Select `/Users/namanchachan/Downloads/SpotifyFeatures.csv`
   - Click "Upload CSV"
   - Wait for: "Successfully uploaded X song items!"

### 6. Verify Data

1. **Check Website:**
   - Go to "Movies" page - should show your movies
   - Go to "Songs" page - should show your songs
   - Go to "Books" page - should show your books

2. **Check MongoDB Compass:**
   - Open MongoDB Compass
   - Connect to `localhost:27017`
   - Select database: `multirec`
   - Click collection: `contents`
   - Filter by: `{type: "movie"}` or `{type: "song"}` or `{type: "book"}`

### 7. Start Using!

- **Browse Content:** Visit Movies/Songs/Books pages
- **Rate Content:** Click stars on content cards
- **Get Recommendations:** Check Dashboard for personalized recommendations
- **View Visualizations:** Add Power BI reports in "Visualizations" tab

## Data Mapping

Your CSV files are automatically mapped:

### Movies CSV → MultiRec
- `title` → Title
- `overview` → Description
- `genres` → Genres (parsed)
- `release_date` → Year
- `vote_average` → Rating
- `vote_count` → Rating Count
- `director` → Director
- `runtime` → Duration

### Books CSV → MultiRec
- `title` → Title
- `authors` → Author
- `average_rating` → Rating
- `ratings_count` → Rating Count
- `publication_date` → Year

### Spotify CSV → MultiRec
- `track_name` → Title
- `artist_name` → Artist
- `genre` → Genre
- `duration_ms` → Duration (seconds)

## Tips

1. **Large Files:** If files are very large (>10MB), consider splitting them
2. **Filtering:** The website will show all data, use filters on pages
3. **Ratings:** Rate some content to improve recommendations
4. **Visualizations:** Add Power BI reports in "Visualizations" tab

## Need Help?

- Check `README.md` for full documentation
- Check `SETUP.md` for detailed setup
- Check `CSV_FORMAT.md` for CSV format details
- Check backend/ML API console for errors



