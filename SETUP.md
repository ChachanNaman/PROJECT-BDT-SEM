# MultiRec Setup Guide

## Quick Start Guide

Follow these steps to set up and run the MultiRec recommendation system.

## Step 1: Install Prerequisites

### MongoDB
- **macOS**: `brew install mongodb-community`
- **Windows**: Download from [MongoDB Website](https://www.mongodb.com/try/download/community)
- **Linux**: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

Start MongoDB:
```bash
# macOS/Linux
brew services start mongodb-community
# Or manually:
mongod --config /usr/local/etc/mongod.conf

# Windows
# Start MongoDB from Services or run mongod.exe
```

### Node.js
- Download from [Node.js Website](https://nodejs.org/)
- Version 16 or higher required
- Verify: `node --version`

### Python
- Download from [Python Website](https://www.python.org/)
- Version 3.8 or higher required
- Verify: `python3 --version`

## Step 2: Backend Setup

```bash
cd ~/Desktop/MultiRec/backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/multirec
JWT_SECRET=your_super_secret_jwt_key_here
ML_API_URL=http://localhost:8000
```

Start backend:
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

Backend runs on: `http://localhost:5000`

## Step 3: ML API Setup

```bash
cd ~/Desktop/MultiRec/ml-api
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb://localhost:27017/multirec
```

Start ML API:
```bash
python app.py
```

ML API runs on: `http://localhost:8000`

## Step 4: Frontend Setup

```bash
cd ~/Desktop/MultiRec/frontend
npm install
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ML_API_URL=http://localhost:8000
```

Start frontend:
```bash
npm start
```

Frontend runs on: `http://localhost:3000`

## Step 5: Upload Your CSV Data

### Option 1: Via Website (Recommended)

1. Open `http://localhost:3000` in your browser
2. Register a new account
3. Login to your account
4. Go to "Upload Data" page (in sidebar)
5. Select content type (Movies/Songs/Books)
6. Choose your CSV file
7. Click "Upload CSV"

### Option 2: CSV File Format

Your CSV files should have these columns:

**Required:**
- `title` or `name` - Content title

**Optional:**
- `description` - Content description
- `genre` - Genres (comma or pipe-separated)
- `year` - Release year
- `rating` - Average rating (0-5)
- `imageUrl` - Image URL

**Movies:**
- `director` - Director name
- `duration` - Duration in minutes

**Songs:**
- `artist` - Artist name
- `duration` - Duration in seconds

**Books:**
- `author` - Author name

### Example CSV Files

**movies.csv:**
```csv
title,director,year,genre,description,rating
The Matrix,The Wachowskis,1999,"Sci-Fi,Action","A computer hacker learns about reality",4.5
Inception,Christopher Nolan,2010,"Sci-Fi,Thriller","A skilled thief enters people's dreams",4.7
```

**songs.csv:**
```csv
title,artist,year,genre,duration
Bohemian Rhapsody,Queen,1975,Rock,355
Hotel California,Eagles,1976,Rock,391
```

**books.csv:**
```csv
title,author,year,genre,description,rating
1984,George Orwell,1949,"Fiction,Dystopia","A dystopian novel",4.8
To Kill a Mockingbird,Harper Lee,1960,"Fiction,Classic","A story of racial injustice",4.6
```

## Step 6: Power BI Integration (Optional)

1. Create a Power BI report with your data
2. Publish to Power BI Service
3. Get the embed URL:
   - File > Embed report > Website or portal
   - Copy the embed URL or iframe code
4. In MultiRec website:
   - Go to "Visualizations" page
   - Paste the URL or iframe code
   - Click "Load Visualization"

## Running All Services

Open 3 terminal windows:

**Terminal 1 - Backend:**
```bash
cd ~/Desktop/MultiRec/backend
npm start
```

**Terminal 2 - ML API:**
```bash
cd ~/Desktop/MultiRec/ml-api
source venv/bin/activate
python app.py
```

**Terminal 3 - Frontend:**
```bash
cd ~/Desktop/MultiRec/frontend
npm start
```

## Testing the System

1. **Health Check**
   - Backend: `http://localhost:5000/api/health`
   - ML API: `http://localhost:8000/health`

2. **Create Account**
   - Go to `http://localhost:3000`
   - Click "Register"
   - Fill in details
   - Select role (User or Kid)

3. **Upload Data**
   - Login to your account
   - Go to "Upload Data"
   - Upload your CSV files

4. **Browse Content**
   - Go to Movies/Songs/Books pages
   - Browse and rate content

5. **View Recommendations**
   - Check dashboard for personalized recommendations
   - Rate more content to improve recommendations

## Common Issues

### MongoDB Not Starting
- Check if MongoDB is installed correctly
- Verify MongoDB is running: `ps aux | grep mongod`
- Check MongoDB logs

### Port Already in Use
- Backend (5000): Change `PORT` in backend `.env`
- ML API (8000): Change port in `ml-api/app.py`
- Frontend (3000): React will prompt to use another port

### CORS Errors
- Ensure backend CORS is enabled
- Check API URLs in frontend `.env`
- Verify backend and ML API are running

### CSV Upload Fails
- Check CSV format matches requirements
- Verify file is under 10MB
- Check backend logs for errors

### Recommendations Not Showing
- Ensure you've rated some content
- Check ML API is running
- Verify user ID is correct

## Next Steps

1. Upload your CSV files
2. Rate content to build your profile
3. Explore recommendations
4. Add Power BI visualizations
5. Customize for your needs!

## Need Help?

- Check `README.md` for detailed documentation
- Review error logs in terminal windows
- Verify all services are running
- Check MongoDB connection



