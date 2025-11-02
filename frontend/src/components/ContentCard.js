import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ratingsAPI } from '../services/api';

const ContentCard = ({ content, onRatingUpdate }) => {
  const { isAuthenticated } = useAuth();
  const [userRating, setUserRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && content._id) {
      fetchUserRating();
    }
  }, [content._id, isAuthenticated]);

  const fetchUserRating = async () => {
    try {
      if (!content._id) return;
      const response = await ratingsAPI.getContentRating(content._id);
      if (response.data && response.data.rating) {
        setUserRating(response.data.rating);
      } else {
        setUserRating(null);
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
      setUserRating(null);
    }
  };

  const handleRating = async (rating) => {
    if (!isAuthenticated) {
      alert('Please login to rate content');
      return;
    }

    if (!content._id) {
      alert('Content ID is missing');
      return;
    }

    setLoading(true);
    try {
      const response = await ratingsAPI.addRating({
        contentId: content._id,
        rating
      });
      
      if (response.data) {
        setUserRating(rating);
        console.log('Rating saved successfully:', response.data);
        // Refetch to confirm
        await fetchUserRating();
        if (onRatingUpdate) {
          onRatingUpdate();
        }
      }
    } catch (error) {
      console.error('Error adding rating:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to submit rating: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'movie':
        return '🎬';
      case 'song':
        return '🎵';
      case 'book':
        return '📚';
      default:
        return '📄';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'movie':
        return 'bg-purple-100 text-purple-800';
      case 'song':
        return 'bg-pink-100 text-pink-800';
      case 'book':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
        {content.imageUrl ? (
          <img
            src={content.imageUrl}
            alt={content.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-6xl">
          {getTypeIcon(content.type)}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
            {content.title}
          </h3>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(content.type)}`}>
            {content.type}
          </span>
        </div>

        {content.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {content.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {content.genre?.slice(0, 3).map((genre, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-yellow-500 mr-1">⭐</span>
            <span className="text-sm font-medium text-gray-700">
              {content.rating?.toFixed(1) || 'N/A'}
            </span>
            <span className="text-xs text-gray-500 ml-1">
              ({content.ratingCount || 0})
            </span>
          </div>
          {content.year && (
            <span className="text-xs text-gray-500">{content.year}</span>
          )}
        </div>

        {isAuthenticated && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Your Rating:</span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={loading}
                    className={`text-2xl transition-colors ${
                      star <= (hoverRating || userRating || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-yellow-400'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCard;

