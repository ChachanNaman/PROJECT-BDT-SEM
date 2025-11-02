# MultiRec - Multi-Domain Recommendation System

A full-stack recommendation system for Movies, Songs, and Books with personalized recommendations using hybrid content-based and collaborative filtering.

## Tech Stack

### Frontend
- **React.js** (JavaScript/JSX only - no TypeScript)
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **Multer** for file uploads

### ML API
- **Python Flask**
- **scikit-learn** for recommendation algorithms
- **TF-IDF** for content-based filtering
- **Collaborative filtering** for user-based recommendations

## Project Structure

```
MultiRec/
├── backend/          # Node.js/Express backend
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── middleware/   # Auth middleware
│   └── server.js     # Main server file
├── frontend/         # React.js frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React Context (Auth)
│   │   ├── services/     # API service functions
│   │   └── App.js        # Main App component
│   └── package.json
├── ml-api/           # Python Flask ML API
│   ├── app.py        # Main Flask app
│   └── requirements.txt
├── uploads/          # Uploaded CSV files (temporary)
└── datasets/         # Place your CSV files here
```

## Features

1. **Authentication & Authorization**
   - User registration and login
   - JWT-based authentication
   - User roles (User/Kid)
   - Protected routes

2. **Content Management**
   - Browse Movies, Songs, and Books
   - Search and filter content
   - View content details
   - Rate content (1-5 stars)

3. **Recommendations**
   - Personalized recommendations based on user ratings
   - Hybrid recommendation system (content-based + collaborative filtering)
   - Trending items
   - Similar items

4. **Data Upload**
   - Upload CSV files for Movies, Songs, and Books
   - Automatic parsing and MongoDB import
   - Flexible CSV format support

5. **Visualizations**
   - Power BI integration
   - Embed visualizations in the website

## Setup Instructions

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (running locally or connection string)
- **npm** or **yarn**

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm start
# Or for development: npm run dev
```

Backend will run on `http://localhost:5000`

### 2. ML API Setup

```bash
cd ml-api
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MongoDB URI
python app.py
```

ML API will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with API URLs
npm start
```

Frontend will run on `http://localhost:3000`

## MongoDB Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `multirec`
3. Update the `MONGODB_URI` in `.env` files:
   ```
   MONGODB_URI=mongodb://localhost:27017/multirec
   ```

## Uploading Your CSV Files

1. Place your CSV files in the `datasets/` folder or upload via the website
2. CSV format requirements:
   - **Required**: `title` (or `name`) column
   - **Optional**: `description`, `genre`, `year`, `rating`, etc.
   - **Movies**: Add `director`, `duration` columns
   - **Songs**: Add `artist`, `duration` columns
   - **Books**: Add `author` column
   - Genres can be comma or pipe-separated

3. Upload via the website:
   - Login to your account
   - Go to "Upload Data" page
   - Select content type (Movies/Songs/Books)
   - Choose your CSV file
   - Click "Upload CSV"

## CSV File Format Examples

### Movies CSV
```csv
title,director,year,genre,description,rating
The Matrix,The Wachowskis,1999,"Sci-Fi,Action","A computer hacker learns about the true nature of reality",4.5
```

### Songs CSV
```csv
title,artist,year,genre,duration
Bohemian Rhapsody,Queen,1975,Rock,355
```

### Books CSV
```csv
title,author,year,genre,description
1984,George Orwell,1949,"Fiction,Dystopia","A dystopian social science fiction novel",4.8
```

## Power BI Integration

1. Create your Power BI report
2. Publish it to Power BI Service
3. Get the embed URL or iframe code
4. Go to "Visualizations" page in the website
5. Paste the URL or iframe code
6. Click "Load Visualization"

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Content
- `GET /api/content` - Get all content (with filters)
- `GET /api/content/:id` - Get content by ID
- `GET /api/content/type/:type` - Get content by type

### Ratings
- `POST /api/ratings` - Add/update rating
- `GET /api/ratings/user` - Get user's ratings
- `GET /api/ratings/content/:contentId` - Get rating for content

### Search
- `GET /api/search` - Search content

### Upload
- `POST /api/upload/csv` - Upload CSV file

### ML API
- `POST /recommendations/:type` - Get recommendations
- `GET /trending/:type` - Get trending items
- `GET /similar/:id` - Get similar items

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/multirec
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
ML_API_URL=http://localhost:8000
```

### ML API (.env)
```
MONGODB_URI=mongodb://localhost:27017/multirec
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ML_API_URL=http://localhost:8000
```

## Running the Complete System

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   npm start
   ```

3. **Start ML API** (Terminal 2)
   ```bash
   cd ml-api
   source venv/bin/activate
   python app.py
   ```

4. **Start Frontend** (Terminal 3)
   ```bash
   cd frontend
   npm start
   ```

5. **Open Browser**
   - Navigate to `http://localhost:3000`
   - Register a new account
   - Start exploring!

## Usage

1. **Register/Login**: Create an account or login
2. **Upload Data**: Upload your CSV files via the "Upload Data" page
3. **Browse Content**: Explore Movies, Songs, and Books
4. **Rate Content**: Rate items to improve recommendations
5. **Get Recommendations**: View personalized recommendations on the dashboard
6. **Visualizations**: Add Power BI visualizations in the "Visualizations" tab

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MongoDB URI in `.env` files
- Verify database name is correct

### CORS Issues
- Ensure backend CORS is configured correctly
- Check API URLs in frontend `.env`

### Upload Issues
- Verify CSV format matches requirements
- Check file size (max 10MB)
- Ensure proper content type selection

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please check the documentation or create an issue in the repository.

