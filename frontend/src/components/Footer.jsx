import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">FitCheck</h3>
            <p className="text-gray-300">
              Bridging the gap between job requirements and candidate qualifications.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/resume/upload" className="text-gray-300 hover:text-white transition-colors">
                  Upload Resume
                </Link>
              </li>
              <li>
                <Link to="/job/create" className="text-gray-300 hover:text-white transition-colors">
                  Add Job
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <p className="text-gray-300 mb-2">
              Have questions? Reach out to us.
            </p>
            <a
              href="mailto:support@FitCheck.com"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              support@FitCheck.com
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} FitCheck. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;