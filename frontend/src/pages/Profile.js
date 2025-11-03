import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';

const Profile = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    preferences: {
      genres: [],
      age: '',
      favoriteMovies: [],
      favoriteSongs: [],
      favoriteBooks: []
    },
    role: 'user'
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await usersAPI.getProfile();
      setProfile(response.data);
      setFormData({
        preferences: response.data.preferences || {
          genres: [],
          age: '',
          favoriteMovies: [],
          favoriteSongs: [],
          favoriteBooks: []
        },
        role: response.data.role || 'user'
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role') {
      setFormData({ ...formData, role: value });
    } else if (name.startsWith('preferences.')) {
      const key = name.split('.')[1];
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          [key]: value
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    try {
      await usersAPI.updateProfile(formData);
      setSuccess('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Profile Settings</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Account Information</h2>
          <p className="text-gray-600">Username: {profile?.username}</p>
          <p className="text-gray-600">Email: {profile?.email}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="kid">Kid</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="age">
              Age
            </label>
            <input
              type="number"
              id="age"
              name="preferences.age"
              value={formData.preferences.age}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="120"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="genres">
              Favorite Genres (comma-separated)
            </label>
            <input
              type="text"
              id="genres"
              name="preferences.genres"
              value={Array.isArray(formData.preferences.genres) 
                ? formData.preferences.genres.join(', ') 
                : formData.preferences.genres}
              onChange={(e) => {
                const genres = e.target.value.split(',').map(g => g.trim()).filter(g => g);
                setFormData({
                  ...formData,
                  preferences: {
                    ...formData.preferences,
                    genres
                  }
                });
              }}
              placeholder="Action, Comedy, Drama..."
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;



