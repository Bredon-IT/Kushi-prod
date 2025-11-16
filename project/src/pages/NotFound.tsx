import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-8xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
            404
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Oops! The page you're looking for seems to have been cleaned away. 
            Don't worry, we'll help you find what you need.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
          >
            <Home size={20} />
            Go Home
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 border-2 border-orange-500 text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-500 hover:text-white transition-all"
            >
              View Services
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border-2 border-red-500 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-500 hover:text-white transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>

        <div className="mt-12 p-6 bg-white rounded-xl shadow-lg border border-orange-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Looking for something specific?
          </h3>
          <p className="text-gray-600 mb-4">
            Try searching for our cleaning services or contact us directly for assistance.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search our services..."
              className="flex-1 px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
              <Search size={16} />
            </button>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>
            If you believe this is an error, please{' '}
            <Link to="/contact" className="text-orange-600 hover:text-orange-700 font-medium">
              contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;