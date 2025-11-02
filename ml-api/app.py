print("Loading dependencies...")
from flask import Flask, request, jsonify
print("✓ Flask loaded")
from flask_cors import CORS
print("✓ Flask-CORS loaded")
from pymongo import MongoClient
print("✓ PyMongo loaded")
import numpy as np
print("✓ NumPy loaded")
import pandas as pd
print("✓ Pandas loaded")
print("Loading scipy (this may take a moment)...")
from scipy.sparse import csr_matrix
print("✓ SciPy loaded")
print("Loading sklearn (this may take a moment)...")
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
print("✓ scikit-learn loaded")
import os
from dotenv import load_dotenv

print("Loading environment variables...")
load_dotenv()
print("✓ Environment loaded")

print("Initializing Flask app...")
app = Flask(__name__)
CORS(app)
print("✓ Flask app initialized")

# MongoDB connection
print("Connecting to MongoDB...")
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/multirec')
try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    # Test connection
    client.admin.command('ping')
    db = client.multirec
    print(f"✓ Connected to MongoDB: {MONGODB_URI}")
except Exception as e:
    print(f"⚠️  MongoDB connection warning: {e}")
    print("Continuing anyway (MongoDB may be needed later)")
    db = None

# Global variables for models (loaded on demand)
content_vectors = {}
tfidf_vectorizers = {}
content_dataframes = {}

def load_content_data(content_type):
    """Load content data from MongoDB and prepare for recommendation"""
    if content_type in content_dataframes:
        return content_dataframes[content_type]
    
    if db is None:
        return pd.DataFrame()
    
    collection = db.contents
    contents = list(collection.find({'type': content_type}))
    
    if not contents:
        return pd.DataFrame()
    
    df = pd.DataFrame(contents)
    
    # Create feature vector from title, description, and genres
    df['features'] = df.apply(lambda row: ' '.join([
        str(row.get('title', '')),
        str(row.get('description', '')),
        ' '.join(row.get('genre', []))
    ]), axis=1)
    
    content_dataframes[content_type] = df
    return df

def build_recommendation_model(content_type):
    """Build TF-IDF based content similarity model"""
    df = load_content_data(content_type)
    
    if df.empty:
        return None, None
    
    # Create TF-IDF vectorizer
    vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    
    # Fit and transform
    tfidf_matrix = vectorizer.fit_transform(df['features'].fillna(''))
    
    tfidf_vectorizers[content_type] = vectorizer
    content_vectors[content_type] = tfidf_matrix
    
    return vectorizer, tfidf_matrix

def get_user_ratings(user_id):
    """Get user ratings from MongoDB"""
    if db is None:
        return pd.DataFrame()
    ratings = list(db.ratings.find({'userId': user_id}))
    return pd.DataFrame(ratings)

def get_trending_items(content_type, limit=10):
    """Get trending items based on rating count and average rating"""
    if db is None:
        return []
    
    pipeline = [
        {'$match': {'type': content_type}},
        {'$sort': {'ratingCount': -1, 'rating': -1}},
        {'$limit': limit}
    ]
    
    items = list(db.contents.aggregate(pipeline))
    # Convert ObjectId to string for JSON serialization
    for item in items:
        item['_id'] = str(item['_id'])
    
    return items

def get_similar_items(content_id, content_type, limit=10):
    """Get similar items using content-based filtering"""
    # Build model if not exists
    if content_type not in content_vectors:
        vectorizer, tfidf_matrix = build_recommendation_model(content_type)
        if vectorizer is None:
            return []
    else:
        vectorizer = tfidf_vectorizers[content_type]
        tfidf_matrix = content_vectors[content_type]
        df = content_dataframes[content_type]
    
    # Find content in dataframe
    if db is None:
        return []
    
    content = db.contents.find_one({'_id': content_id})
    if not content or content.get('type') != content_type:
        return []
    
    df = content_dataframes[content_type]
    
    try:
        content_idx = df[df['_id'] == content_id].index[0]
    except IndexError:
        # Content not in dataframe, rebuild
        df = load_content_data(content_type)
        if df.empty:
            return []
        vectorizer, tfidf_matrix = build_recommendation_model(content_type)
        try:
            content_idx = df[df['_id'] == content_id].index[0]
        except IndexError:
            return []
    
    # Calculate similarity
    content_vector = tfidf_matrix[content_idx:content_idx+1]
    similarities = cosine_similarity(content_vector, tfidf_matrix).flatten()
    
    # Get top similar items (excluding the item itself)
    similar_indices = similarities.argsort()[-limit-1:-1][::-1]
    
    similar_items = []
    for idx in similar_indices:
        item = df.iloc[idx].to_dict()
        item['_id'] = str(item['_id'])
        item['similarity'] = float(similarities[idx])
        similar_items.append(item)
    
    return similar_items

def hybrid_recommendation(user_id, content_type, limit=10):
    """Hybrid recommendation combining content-based and collaborative filtering"""
    # Get user ratings
    ratings_df = get_user_ratings(user_id)
    
    if ratings_df.empty:
        # No ratings, return trending items
        return get_trending_items(content_type, limit)
    
    # Content-based filtering
    df = load_content_data(content_type)
    if df.empty:
        return []
    
    # Build model
    if content_type not in content_vectors:
        build_recommendation_model(content_type)
    
    if content_type not in content_vectors:
        return []
    
    # Get items user has rated
    rated_content_ids = ratings_df['contentId'].tolist()
    
    # Calculate weighted scores
    recommendations = {}
    
    for _, rating_row in ratings_df.iterrows():
        content_id = rating_row['contentId']
        rating = rating_row['rating']
        
        # Get similar items
        similar = get_similar_items(content_id, content_type, limit=20)
        
        for item in similar:
            item_id = str(item['_id'])
            if item_id not in rated_content_ids:
                if item_id not in recommendations:
                    recommendations[item_id] = {
                        'score': 0,
                        'item': item
                    }
                # Weight by rating and similarity
                recommendations[item_id]['score'] += rating * item.get('similarity', 0)
    
    # Sort by score
    sorted_recs = sorted(recommendations.values(), key=lambda x: x['score'], reverse=True)
    
    result = []
    for rec in sorted_recs[:limit]:
        item = rec['item']
        item['score'] = rec['score']
        result.append(item)
    
    # If not enough recommendations, fill with trending
    if len(result) < limit:
        trending = get_trending_items(content_type, limit - len(result))
        trending_ids = [str(r['_id']) for r in result]
        for item in trending:
            if str(item['_id']) not in trending_ids and str(item['_id']) not in rated_content_ids:
                result.append(item)
    
    return result[:limit]

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK', 'message': 'MultiRec ML API is running'})

@app.route('/recommendations/<content_type>', methods=['POST'])
def get_recommendations(content_type):
    try:
        data = request.json
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({'error': 'userId is required'}), 400
        
        if content_type not in ['movie', 'song', 'book']:
            return jsonify({'error': 'Invalid content type'}), 400
        
        limit = data.get('limit', 10)
        
        recommendations = hybrid_recommendation(user_id, content_type, limit)
        
        return jsonify({'recommendations': recommendations})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/trending/<content_type>', methods=['GET'])
def get_trending(content_type):
    try:
        if content_type not in ['movie', 'song', 'book']:
            return jsonify({'error': 'Invalid content type'}), 400
        
        limit = int(request.args.get('limit', 10))
        
        items = get_trending_items(content_type, limit)
        
        return jsonify({'items': items})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/similar/<content_id>', methods=['GET'])
def get_similar(content_id):
    try:
        from bson import ObjectId
        
        content = db.contents.find_one({'_id': ObjectId(content_id)})
        if not content:
            return jsonify({'error': 'Content not found'}), 404
        
        content_type = content.get('type')
        limit = int(request.args.get('limit', 10))
        
        similar_items = get_similar_items(ObjectId(content_id), content_type, limit)
        
        return jsonify({'items': similar_items})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/preload/<content_type>', methods=['POST'])
def preload_model(content_type):
    """Preload recommendation model for a content type"""
    try:
        if content_type not in ['movie', 'song', 'book']:
            return jsonify({'error': 'Invalid content type'}), 400
        
        build_recommendation_model(content_type)
        
        return jsonify({'message': f'Model for {content_type} preloaded successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 MultiRec ML API Starting...")
    print("="*50)
    print("Server will start on: http://localhost:8000")
    print("="*50 + "\n")
    app.run(debug=True, host='0.0.0.0', port=8000)

