import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AttendeeContext } from '../AttendeeContext';
import { PhotoContext } from '../PhotoContext';
import { useNavigation } from '../hooks/useNavigation';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    showResetModal,
    setShowResetModal,
    showSuccessToast,
    setShowSuccessToast,
    toastMessage
  } = useNavigation();

  const { 
    attendees,
    selectedAttendee, 
    setSelectedAttendee, 
    resetToInitial, 
    fetchAttendees 
  } = useContext(AttendeeContext);

  const { 
    photoSessions, 
    setPhotoSessions 
  } = useContext(PhotoContext);

  const handleReset = async () => {
    try {
      // Reset both contexts
      await resetToInitial();
      setPhotoSessions([]);
      setSelectedAttendee(null);
      
      // Clear local storage
      localStorage.removeItem('hydro_attendees');
      localStorage.removeItem('hydro_photo_sessions');
      
      // Fetch fresh data
      await fetchAttendees();
      
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Failed to reset data. Please try again.');
    }
  };

  const handleExport = async () => {
    try {
      // Combine attendee and photo session data
      const exportData = attendees.map(attendee => {
        const photoSession = photoSessions.find(s => s.attendeeId === attendee.id);
        return {
          ...attendee,
          photoTimeSlot: photoSession?.timeSlot || attendee.photographyTimeSlot || '',
          photoEmail: photoSession?.email || attendee.photographyEmail || '',
          photoStatus: photoSession?.status || attendee.photographyStatus || 'pending'
        };
      });

      // Convert to CSV
      const csvContent = convertToCSV(exportData);
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `holiday_party_data_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const navItems = [
    { path: '/', label: 'Attendee List' },
    { path: '/photo-sessions', label: 'Photo Sessions' }
  ];

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
              onClick={() => setShowResetModal(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reset Data
            </button>
            <button
              onClick={handleExport}
              className="ml-4 px-4 py-2 text-sm font-medium text-green-600 bg-green-100 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Export to CSV
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
            onClick={() => setShowResetModal(true)}
            className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Reset Data
          </button>
          <button
            onClick={handleExport}
            className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-green-600 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Export to CSV
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Reset</h2>
            <p className="mb-4">Are you sure you want to reset all data? This action cannot be undone.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleReset();
                  setShowResetModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}
    </nav>
  );
};

// Helper function to convert data to CSV
const convertToCSV = (data) => {
  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Photo Time',
    'Photo Email',
    'Photo Status',
    'Service Center',
    'Children',
    'Guests'
  ];

  const rows = data.map(item => [
    item.firstName,
    item.lastName,
    item.email,
    item.photoTimeSlot,
    item.photoEmail,
    item.photoStatus,
    item.serviceCenter,
    (item.children || []).map(c => c.name).join('; '),
    (item.guestNames || []).join('; ')
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
  ].join('\n');
};

export default Navigation;
