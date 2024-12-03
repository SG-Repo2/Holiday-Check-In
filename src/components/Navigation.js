import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AttendeeContext } from '../AttendeeContext';
import { PhotoContext } from '../PhotoContext';
import initialData from '../attendees2024.json';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { selectedAttendee, setAttendees } = useContext(AttendeeContext);
  const { setPhotoSessions } = useContext(PhotoContext);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Attendee List' },
    { path: '/photo-sessions', label: 'Photo Sessions' }
  ];

  const NavLink = ({ path, label }) => (
    <Link
      to={path}
      className={`
        px-4 py-2 rounded-md text-sm font-medium transition-colors
        ${location.pathname === path
          ? 'bg-hydro-blue text-white'
          : 'text-gray-700 hover:bg-gray-100'
        }
        md:w-auto w-full text-left
      `}
    >
      {label}
    </Link>
  );

  const handleReset = () => {
    if (window.confirm('Reset data? This will restore the original attendee list and remove any added attendees.')) {
      // Reset to initial data from JSON file
      setAttendees(initialData.attendees);
      
      // Save attendees to localStorage
      localStorage.setItem('attendees', JSON.stringify(initialData.attendees));
      
      // Clear photo sessions
      localStorage.removeItem('photoSessions');
      setPhotoSessions([]);

      // Navigate to home page
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-16 w-full bg-white shadow-md z-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-14 items-center">
          <div className="hidden md:flex space-x-4">
            {navItems.map(item => (
              <NavLink key={item.path} {...item} />
            ))}
          </div>

          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
            >
              Reset Data
            </button>
          )}

          {selectedAttendee && (
            <div className="hidden md:block text-sm text-gray-600">
              Selected: {selectedAttendee.firstName} {selectedAttendee.lastName}
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <div
          className={`
            md:hidden
            ${isMobileMenuOpen ? 'block' : 'hidden'}
            py-2 space-y-2
          `}
        >
          {navItems.map(item => (
            <NavLink key={item.path} {...item} />
          ))}
          {selectedAttendee && (
            <div className="px-4 py-2 text-sm text-gray-600">
              Selected: {selectedAttendee.firstName} {selectedAttendee.lastName}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
