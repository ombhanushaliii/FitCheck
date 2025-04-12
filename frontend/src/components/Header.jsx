import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold">
            FitCheck
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={toggleMenu}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-blue-200 transition-colors">
              Home
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200 transition-colors">
                  Dashboard
                </Link>
                <Link to="/resume/upload" className="hover:text-blue-200 transition-colors">
                  Upload Resume
                </Link>
                <Link to="/job/create" className="hover:text-blue-200 transition-colors">
                  Add Job
                </Link>
                <button
                  onClick={logout}
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2">
            <Link
              to="/"
              className="block py-2 hover:text-blue-200 transition-colors"
              onClick={toggleMenu}
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block py-2 hover:text-blue-200 transition-colors"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/resume/upload"
                  className="block py-2 hover:text-blue-200 transition-colors"
                  onClick={toggleMenu}
                >
                  Upload Resume
                </Link>
                <Link
                  to="/job/create"
                  className="block py-2 hover:text-blue-200 transition-colors"
                  onClick={toggleMenu}
                >
                  Add Job
                </Link>
                <button
                  onClick={() => {
                    logout();
                    toggleMenu();
                  }}
                  className="block w-full text-left py-2 hover:text-blue-200 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 hover:text-blue-200 transition-colors"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block py-2 hover:text-blue-200 transition-colors"
                  onClick={toggleMenu}
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;