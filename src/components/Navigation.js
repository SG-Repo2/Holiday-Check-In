import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AttendeeContext } from '../AttendeeContext';
import { PhotoContext } from '../PhotoContext';
import initialData from '../attendees2024.json';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { selectedAttendee, resetToInitial } = useContext(AttendeeContext);
  const { setPhotoSessions } = useContext(PhotoContext);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Attendee List' },
    { path: '/photo-sessions', label: 'Photo Sessions' }
  ];

  const handleReset = () => {
    if (window.confirm('Reset data? This will restore the original attendee list and remove any added attendees.')) {
      // Reset attendees using context function
      resetToInitial();
      
      // Clear photo sessions
      localStorage.removeItem('photoSessions');
      setPhotoSessions([]);

      // Navigate to home page
      navigate('/');
    }
  };

  return (
    <nav className="bg-hydro-blue fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-white text-xl font-bold">Holiday Party Check-In</h1>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      px-4 py-2 rounded-md text-sm font-medium transition-colors
                      ${location.pathname === item.path
                        ? 'bg-white text-hydro-blue'
                        : 'text-white hover:bg-blue-700'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Reset Data
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-blue-700 p-2 rounded-md"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-hydro-blue`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                block px-3 py-2 rounded-md text-base font-medium transition-colors
                ${location.pathname === item.path
                  ? 'bg-white text-hydro-blue'
                  : 'text-white hover:bg-blue-700'
                }
              `}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleReset}
            className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Reset Data
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
