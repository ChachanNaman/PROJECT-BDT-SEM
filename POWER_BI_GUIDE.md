# Power BI Integration Guide for MultiRec

This guide shows you how to create Power BI visualizations from your MultiRec MongoDB data and embed them in your website.

## Step 1: Install Power BI Desktop

1. **Download Power BI Desktop:**
   - Go to: https://powerbi.microsoft.com/desktop/
   - Download the free version
   - Install on your Mac (or Windows if available)

**Note:** Power BI Desktop is primarily for Windows, but you can:
- Use Power BI Service (web-based)
- Use Parallels/VM for Windows
- Or use alternative BI tools that work on Mac (Tableau Public, Google Data Studio)

## Step 2: Connect Power BI to MongoDB

### Option A: Using MongoDB Connector (Power BI Desktop - Windows)

1. **Open Power BI Desktop**
2. **Get Data:**
   - Click "Get Data" → "More..."
   - Search for "MongoDB"
   - Select "MongoDB database"
   - Click "Connect"

3. **Enter Connection Details:**
   - **Server:** `localhost:27017`
   - **Database:** `multirec`
   - **Authentication:** None (for local MongoDB)
   - Click "OK"

4. **Select Collection:**
   - Select `contents` collection
   - Click "OK"
   - Wait for data to load

5. **Transform Data:**
   - Click "Transform Data" if needed
   - Expand nested fields if any
   - Filter by type: `{type: "movie"}`, `{type: "song"}`, `{type: "book"}`

### Option B: Export from MongoDB to CSV/Excel (Mac Compatible)

Since Power BI Desktop is Windows-only, here's a Mac-compatible approach:

1. **Export data from MongoDB:**
   ```bash
   # Export movies
   mongoexport --host localhost:27017 --db multirec --collection contents --query '{type: "movie"}' --out movies_export.json --jsonArray
   
   # Export songs
   mongoexport --host localhost:27017 --db multirec --collection contents --query '{type: "song"}' --out songs_export.json --jsonArray
   
   # Export books
   mongoexport --host localhost:27017 --db multirec --collection contents --query '{type: "book"}' --out books_export.json --jsonArray
   ```

2. **Convert JSON to CSV** (or use MongoDB Compass export):
   - Open MongoDB Compass
   - Connect to `localhost:27017`
   - Select database: `multirec`
   - Select collection: `contents`
   - Filter: `{type: "movie"}` (or song/book)
   - Click "Export Collection" → Choose "CSV"
   - Save as `movies_export.csv`

3. **Import to Power BI Service or Alternative:**
   - Use Power BI Service (web-based)
   - Or use Google Data Studio (free, works on Mac)
   - Or use Tableau Public (free, works on Mac)

### Option C: Use Power BI Service (Web-based - Mac Compatible)

1. **Sign up for Power BI Service:**
   - Go to: https://powerbi.microsoft.com/
   - Sign up for free account
   - Use Power BI Service (web-based)

2. **Upload Data:**
   - Export data from MongoDB Compass as CSV
   - Go to Power BI Service
   - Upload the CSV file
   - Create visualizations

## Step 3: Create Visualizations

### Recommended Visualizations for MultiRec:

1. **Content Distribution by Type:**
   - **Chart Type:** Pie or Donut chart
   - **Fields:** Count of content grouped by `type` (Movie, Song, Book)
   - **Shows:** How many movies vs songs vs books

2. **Average Ratings by Genre:**
   - **Chart Type:** Bar chart
   - **Fields:** X-axis: `genre` (flattened), Y-axis: Average `rating`
   - **Shows:** Which genres have highest ratings

3. **Top Rated Content:**
   - **Chart Type:** Table or Bar chart
   - **Fields:** `title`, `rating`, `ratingCount`
   - **Filter:** Top 10 by rating
   - **Shows:** Most popular content

4. **Content by Year:**
   - **Chart Type:** Line chart
   - **Fields:** X-axis: `year`, Y-axis: Count of content
   - **Shows:** Content release trends over time

5. **Rating Distribution:**
   - **Chart Type:** Histogram
   - **Fields:** `rating` grouped into bins
   - **Shows:** Distribution of ratings (1-5 stars)

6. **Content Count by Genre:**
   - **Chart Type:** Treemap or Bar chart
   - **Fields:** `genre` (flattened), Count
   - **Shows:** Most common genres

## Step 4: Publish to Power BI Service

1. **Publish Report:**
   - In Power BI Desktop: File → Publish → Power BI
   - Or in Power BI Service: Upload your .pbix file
   - Sign in to Power BI account
   - Choose workspace (or create new)
   - Wait for publish to complete

2. **Verify Report:**
   - Go to Power BI Service
   - Open your report
   - Make sure visualizations are visible

## Step 5: Get Embed URL

1. **Get Embed Code:**
   - In Power BI Service, open your report
   - Click "..." (More options) → "Embed report" → "Website or portal"
   - Or: File → Embed report → Website or portal

2. **Copy Embed URL or iframe Code:**
   - Copy the entire iframe code, or
   - Copy the embed URL

**Example iframe code:**
```html
<iframe width="1140" height="541.25" src="https://app.powerbi.com/reportEmbed?reportId=YOUR_REPORT_ID&groupId=YOUR_GROUP_ID&appId=YOUR_APP_ID" frameborder="0" allowFullScreen="true"></iframe>
```

**Or embed URL:**
```
https://app.powerbi.com/reportEmbed?reportId=YOUR_REPORT_ID&groupId=YOUR_GROUP_ID
```

## Step 6: Add to Website

1. **Login to MultiRec Website:**
   - Go to `http://localhost:3000`
   - Login to your account

2. **Go to Visualizations Page:**
   - Click "Visualizations" in the sidebar

3. **Paste Embed Code/URL:**
   - Paste your Power BI embed URL or iframe code
   - Click "Load Visualization"

4. **View Visualization:**
   - Your Power BI report should now be visible on the website!

## Alternative: Using Google Data Studio (Mac Compatible)

If you can't use Power BI Desktop, use Google Data Studio (works on Mac):

1. **Create Data Source:**
   - Export MongoDB data to CSV (using MongoDB Compass)
   - Upload CSV to Google Sheets
   - Connect Google Data Studio to Google Sheets

2. **Create Visualizations:**
   - Same visualizations as Power BI
   - Free and works on Mac

3. **Embed in Website:**
   - Get embed URL from Google Data Studio
   - Paste in "Visualizations" page

## Alternative: Using MongoDB Charts (Native MongoDB Tool)

1. **Use MongoDB Charts:**
   - MongoDB has built-in visualization tool
   - Works directly with MongoDB
   - Free for local MongoDB

2. **Create Visualizations:**
   - Connect to `localhost:27017`
   - Select `multirec` database
   - Create charts

3. **Embed in Website:**
   - Get embed URL from MongoDB Charts
   - Paste in "Visualizations" page

## Quick Setup Script (Export Data)

I've created a script to export your data to CSV for easier import:

```bash
# Run this to export data
cd ~/Desktop/MultiRec
node export-for-powerbi.js
```

This will create:
- `movies_export.csv`
- `songs_export.csv`
- `books_export.csv`
- `all_content_export.csv`

You can then import these into Power BI or any BI tool.

## Troubleshooting

### Can't Connect to MongoDB from Power BI
- **Solution:** Make sure MongoDB is running on `localhost:27017`
- **Solution:** Check firewall settings
- **Solution:** Use MongoDB Compass to export CSV instead

### Power BI Desktop Not Available for Mac
- **Solution:** Use Power BI Service (web-based)
- **Solution:** Use Google Data Studio
- **Solution:** Use Tableau Public
- **Solution:** Use MongoDB Charts

### Embed Code Not Working
- **Solution:** Make sure report is published to Power BI Service
- **Solution:** Check if embed URL is complete
- **Solution:** Verify iframe code is correct
- **Solution:** Check browser console for errors

### Visualizations Not Loading
- **Solution:** Check if Power BI report is public or shared
- **Solution:** Verify authentication is set up correctly
- **Solution:** Check CORS settings (if applicable)

## Recommended Visualizations for Your Project

For your big data project, create these visualizations:

1. **Dataset Overview:**
   - Total content count
   - Distribution by type
   - Content statistics

2. **Ratings Analysis:**
   - Average rating by type
   - Rating distribution
   - Top rated content

3. **Genre Analysis:**
   - Most common genres
   - Genre distribution
   - Average ratings by genre

4. **Temporal Analysis:**
   - Content by year
   - Release trends
   - Decade analysis

5. **User Engagement:**
   - Rating counts
   - Most rated content
   - User rating patterns

These visualizations will demonstrate:
- ✅ Dataset explanation and information
- ✅ Data collection and preprocessing
- ✅ System architecture understanding
- ✅ Big data processing capabilities

## Next Steps

1. **Create Power BI Account** (if you don't have one)
2. **Export Data** from MongoDB (using script or Compass)
3. **Create Visualizations** in Power BI or alternative tool
4. **Publish** your report
5. **Get Embed URL** and add to website
6. **Verify** visualizations are visible on website

Good luck! 🚀



