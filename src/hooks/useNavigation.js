import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AttendeeContext } from '../AttendeeContext';
import { PhotoContext } from '../PhotoContext';

export const useNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { selectedAttendee, resetToInitial, exportAttendeesToCSV } = useContext(AttendeeContext);
  const { setPhotoSessions } = useContext(PhotoContext);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleReset = () => {
    if (window.confirm('Reset data? This will restore the original attendee list and remove any added attendees.')) {
      // Reset attendees using context function
      resetToInitial();
      
      // Clear all stored data including photo sessions
      localStorage.removeItem('hydro_holiday_photo_sessions');
      localStorage.removeItem('photoSessions');
      localStorage.removeItem('photoSessions_lastUpdate');
      setPhotoSessions([]);
      
      setToastMessage('All data has been reset successfully!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  const handleExport = () => {
    const success = exportAttendeesToCSV();
    if (success) {
      setToastMessage('Attendee data exported successfully!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } else {
      setToastMessage('Failed to export attendee data. Please try again.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  return {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    showResetModal,
    setShowResetModal,
    showSuccessToast,
    toastMessage,
    handleReset,
    handleExport
  };
};
