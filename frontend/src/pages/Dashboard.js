import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contentAPI, mlAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ContentCard from '../components/ContentCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState({
    movies: [],
    songs: [],
    books: []
  });
  const [trending, setTrending] = useState({
    movies: [],
    songs: [],
    books: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch trending items
      const [trendingMovies, trendingSongs, trendingBooks] = await Promise.all([
        mlAPI.getTrending('movie', 6),
        mlAPI.getTrending('song', 6),
        mlAPI.getTrending('book', 6)
      ]);

      setTrending({
        movies: trendingMovies.data.items || [],
        songs: trendingSongs.data.items || [],
        books: trendingBooks.data.items || []
      });

      // Fetch recommendations if user is logged in
      if (user?._id) {
        try {
          const [recMovies, recSongs, recBooks] = await Promise.all([
            mlAPI.getRecommendations('movie', user._id, 6),
            mlAPI.getRecommendations('song', user._id, 6),
            mlAPI.getRecommendations('book', user._id, 6)
          ]);

          setRecommendations({
            movies: recMovies.data.recommendations || [],
            songs: recSongs.data.recommendations || [],
            books: recBooks.data.recommendations || []
          });
        } catch (error) {
          console.error('Error fetching recommendations:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title, items, type, hasRecommendations) => {
    if (loading) {
      return (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      );
    }

    if (!items || items.length === 0) {
      return null;
    }

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <Link
            to={`/${type}s`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ContentCard key={item._id} content={item} onRatingUpdate={fetchData} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome {user?.username || 'to MultiRec'}!
        </h1>
        <p className="text-gray-600">
          Discover personalized recommendations for movies, songs, and books.
        </p>
      </div>

      {user?._id && (
        <>
          {renderSection(
            'Recommended for You',
            recommendations.movies.length > 0
              ? recommendations.movies
              : recommendations.songs.length > 0
              ? recommendations.songs
              : recommendations.books,
            'movie',
            true
          )}
        </>
      )}

      {renderSection('Trending Movies', trending.movies, 'movie', false)}
      {renderSection('Trending Songs', trending.songs, 'song', false)}
      {renderSection('Trending Books', trending.books, 'book', false)}
    </div>
  );
};

export default Dashboard;

