import React, { useState, useEffect } from 'react';
import { contentAPI, mlAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ContentCard from '../components/ContentCard';

const ContentList = () => {
  const location = window.location.pathname;
  let type = 'movie';
  if (location.includes('/movies')) type = 'movie';
  else if (location.includes('/songs')) type = 'song';
  else if (location.includes('/books')) type = 'book';
  
  const { user } = useAuth();
  const [contents, setContents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    genre: '',
    sort: 'rating'
  });
  const [showRecommendations, setShowRecommendations] = useState(true);

  useEffect(() => {
    fetchContents();
  }, [type, page, filters]);

  useEffect(() => {
    if (user?._id && showRecommendations) {
      fetchRecommendations();
    }
  }, [type, user]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const params = {
        type,
        page,
        limit: 12,
        sort: filters.sort
      };

      if (filters.genre) {
        params.genre = filters.genre;
      }

      const response = await contentAPI.getAll(params);
      setContents(response.data.contents || []);
    } catch (error) {
      console.error('Error fetching contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await mlAPI.getRecommendations(type, user._id, 12);
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    }
  };

  const getTypeName = () => {
    return type ? type.charAt(0).toUpperCase() + type.slice(1) + 's' : 'Content';
  };

  const getGenres = () => {
    const allGenres = new Set();
    contents.forEach((content) => {
      if (content.genre && Array.isArray(content.genre)) {
        content.genre.forEach((g) => allGenres.add(g));
      }
    });
    return Array.from(allGenres).sort();
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{getTypeName()}</h1>
        
        {user?._id && (
          <div className="flex items-center space-x-4 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showRecommendations}
                onChange={(e) => setShowRecommendations(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show Recommendations</span>
            </label>
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={filters.genre}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Genres</option>
            {getGenres().map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      {showRecommendations && recommendations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Recommended for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map((item) => (
              <ContentCard key={item._id} content={item} onRatingUpdate={fetchContents} />
            ))}
          </div>
          <hr className="my-8 border-gray-300" />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-64 rounded-lg"></div>
          ))}
        </div>
      ) : contents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {contents.map((content) => (
              <ContentCard key={content._id} content={content} onRatingUpdate={fetchContents} />
            ))}
          </div>
          
          <div className="flex justify-center mt-8 space-x-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={contents.length < 12}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No content found.</p>
        </div>
      )}
    </div>
  );
};

export default ContentList;

