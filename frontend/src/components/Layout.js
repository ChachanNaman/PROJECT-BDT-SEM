import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                MultiRec
              </Link>
            </div>
            <nav className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    {user?.username}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {isAuthenticated && (
          <aside className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
            <nav className="p-4">
              <div className="space-y-1">
                <Link
                  to="/"
                  className={`block px-4 py-2 rounded-md text-sm font-medium ${
                    isActive('/') || isActive('/dashboard')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/movies"
                  className={`block px-4 py-2 rounded-md text-sm font-medium ${
                    isActive('/movies')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Movies
                </Link>
                <Link
                  to="/songs"
                  className={`block px-4 py-2 rounded-md text-sm font-medium ${
                    isActive('/songs')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Songs
                </Link>
                <Link
                  to="/books"
                  className={`block px-4 py-2 rounded-md text-sm font-medium ${
                    isActive('/books')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Books
                </Link>
                <Link
                  to="/visualizations"
                  className={`block px-4 py-2 rounded-md text-sm font-medium ${
                    isActive('/visualizations')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Visualizations
                </Link>
                {user?.role !== 'kid' && (
                  <Link
                    to="/upload"
                    className={`block px-4 py-2 rounded-md text-sm font-medium ${
                      isActive('/upload')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Upload Data
                  </Link>
                )}
              </div>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${isAuthenticated ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
          {isAuthenticated ? (
            <div className="p-8">{children}</div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;



