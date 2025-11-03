import React, { useState } from 'react';
import { uploadAPI } from '../services/api';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [contentType, setContentType] = useState('movie');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a CSV file');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await uploadAPI.uploadCSV(file, contentType);
      setMessage(`Successfully uploaded ${response.data.count} ${contentType} items!`);
      setFile(null);
      // Reset file input
      e.target.reset();
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed. Please check your file format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Upload CSV Data</h1>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-900 mb-2">CSV Format Guidelines:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Required columns: <code className="bg-blue-100 px-1 rounded">title</code> (or <code className="bg-blue-100 px-1 rounded">name</code>)</li>
            <li>Optional columns: <code className="bg-blue-100 px-1 rounded">description</code>, <code className="bg-blue-100 px-1 rounded">genre</code>, <code className="bg-blue-100 px-1 rounded">year</code>, <code className="bg-blue-100 px-1 rounded">rating</code></li>
            <li>For movies: <code className="bg-blue-100 px-1 rounded">director</code>, <code className="bg-blue-100 px-1 rounded">duration</code></li>
            <li>For songs: <code className="bg-blue-100 px-1 rounded">artist</code>, <code className="bg-blue-100 px-1 rounded">duration</code></li>
            <li>For books: <code className="bg-blue-100 px-1 rounded">author</code></li>
            <li>Genres can be comma or pipe-separated</li>
          </ul>
        </div>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contentType">
              Content Type
            </label>
            <select
              id="contentType"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="movie">Movies</option>
              <option value="song">Songs</option>
              <option value="book">Books</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
              CSV File
            </label>
            <input
              type="file"
              id="file"
              name="file"
              accept=".csv"
              onChange={handleFileChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {file && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Upload CSV'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;



