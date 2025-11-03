# CSV File Format Guide

This guide explains how to format your CSV files for uploading Movies, Songs, and Books data to MultiRec.

## General Format

All CSV files should:
- Use UTF-8 encoding
- Have a header row with column names
- Use commas (`,`) as delimiters
- Support quoted fields for values containing commas

## Required Columns

### All Content Types
- `title` OR `name` - The title/name of the content (required)

### Movies
- `title` - Movie title (required)
- `director` - Director name (optional)
- `duration` - Duration in minutes (optional)

### Songs
- `title` - Song title (required)
- `artist` - Artist name (optional)
- `duration` - Duration in seconds (optional)

### Books
- `title` - Book title (required)
- `author` - Author name (optional)

## Optional Columns

All content types can use these optional columns:
- `description` - Description or overview
- `genre` - Genres (comma or pipe-separated: `Action,Comedy` or `Action|Comedy`)
- `year` - Release year (numeric)
- `rating` - Average rating (0-5 scale, decimal)
- `ratingCount` - Number of ratings
- `imageUrl` - URL to poster/cover image

## Column Name Variations

The upload system recognizes multiple column name variations:

| Standard | Variations |
|----------|-----------|
| `title` | `Title`, `name`, `Name` |
| `description` | `Description`, `overview`, `Overview` |
| `genre` | `Genre`, `genres`, `Genres` |
| `year` | `Year`, `release_year`, `releaseYear` |
| `rating` | `Rating`, `avg_rating`, `averageRating` |
| `ratingCount` | `rating_count`, `vote_count` |
| `imageUrl` | `image_url`, `poster`, `poster_path` |
| `director` | `Director` |
| `artist` | `Artist`, `artist_name` |
| `author` | `Author`, `author_name` |

## Example Files

### movies.csv

```csv
title,director,year,genre,description,rating,imageUrl
The Matrix,The Wachowskis,1999,"Sci-Fi,Action","A computer hacker learns about the true nature of reality",4.5,https://example.com/matrix.jpg
Inception,Christopher Nolan,2010,"Sci-Fi,Thriller","A skilled thief enters people's dreams",4.7,https://example.com/inception.jpg
The Shawshank Redemption,Frank Darabont,1994,"Drama","Two imprisoned men bond over a number of years",4.8,https://example.com/shawshank.jpg
```

### songs.csv

```csv
title,artist,year,genre,duration,rating
Bohemian Rhapsody,Queen,1975,Rock,355,4.9
Hotel California,Eagles,1976,Rock,391,4.7
Stairway to Heaven,Led Zeppelin,1971,Rock,482,4.8
```

### books.csv

```csv
title,author,year,genre,description,rating
1984,George Orwell,1949,"Fiction,Dystopia","A dystopian social science fiction novel",4.8
To Kill a Mockingbird,Harper Lee,1960,"Fiction,Classic","A story of racial injustice",4.6
The Great Gatsby,F. Scott Fitzgerald,1925,"Fiction,Classic","A story of wealth and decadence",4.5
```

## Genre Format

Genres can be formatted in several ways:

1. **Comma-separated**: `Action,Comedy,Drama`
2. **Pipe-separated**: `Action|Comedy|Drama`
3. **JSON array**: `["Action","Comedy","Drama"]`
4. **Single genre**: `Action`

All formats are automatically parsed and converted to arrays.

## Data Validation

The upload system validates:

- **Title**: Must be present (non-empty)
- **Year**: Must be numeric if provided
- **Rating**: Must be between 0-5 if provided
- **Duration**: Must be numeric if provided
- **Genres**: Parsed from various formats

## Tips for Best Results

1. **Include Descriptions**: Better descriptions improve recommendation quality
2. **Add Genres**: Multiple genres help with content-based filtering
3. **Add Ratings**: Initial ratings help bootstrap the system
4. **Include Images**: Image URLs make the UI more attractive
5. **Consistent Format**: Use consistent naming and formats across files
6. **Clean Data**: Remove empty rows and fix encoding issues

## Common Issues

### Issue: Upload Fails
- **Solution**: Check CSV format, ensure required columns are present
- **Solution**: Verify file size is under 10MB
- **Solution**: Check for special characters or encoding issues

### Issue: Some Rows Not Imported
- **Solution**: Check for empty required fields (title)
- **Solution**: Verify date formats are correct
- **Solution**: Check for malformed CSV rows

### Issue: Genres Not Showing
- **Solution**: Use comma or pipe separators
- **Solution**: Avoid spaces around separators: `Action,Comedy` not `Action , Comedy`
- **Solution**: Check for special characters in genre names

### Issue: Ratings Not Accurate
- **Solution**: Ensure ratings are between 0-5
- **Solution**: Use decimal format: `4.5` not `4,5`
- **Solution**: Remove any non-numeric characters

## File Size Limits

- Maximum file size: **10MB**
- Recommended: Keep files under 5MB for faster uploads
- For large datasets, split into multiple files

## Where to Place CSV Files

You can:
1. **Upload via Website**: Use the "Upload Data" page (recommended)
2. **Place in datasets folder**: Put files in `~/Desktop/MultiRec/datasets/` and upload later

## After Upload

After successful upload:
1. Content will appear in the respective pages (Movies/Songs/Books)
2. Recommendations will start working
3. You can rate content to improve recommendations
4. Trending items will be calculated automatically

## Need Help?

If your CSV file isn't uploading:
1. Check the format matches the examples
2. Verify all required columns are present
3. Check for special characters or encoding issues
4. Try uploading a smaller sample first
5. Check backend logs for detailed error messages



