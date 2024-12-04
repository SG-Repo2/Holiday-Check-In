// src/AttendeeContext.js
import React, { createContext, useState, useEffect } from 'react';
import initialDataFile from './attendees2024.json';

export const AttendeeContext = createContext();

// Storage keys for different types of data
const STORAGE_KEYS = {
  ATTENDEES: 'hydro_holiday_attendees',
  PHOTO_SESSIONS: 'hydro_holiday_photo_sessions',
  VERIFIED_CHILDREN: 'hydro_holiday_verified_children',
  VERIFIED_EMAILS: 'hydro_holiday_verified_emails'
};

// Helper function to convert attendee data to CSV
const convertToCSV = (attendees) => {
  const headers = [
    'id',
    'firstName',
    'lastName',
    'email',
    'serviceCenter',
    'checkedIn',
    'reservation',
    'shuttleBus',
    'children',
    'notes',
    'additionalInfo'
  ];

  const rows = attendees.map(attendee => {
    const row = {};
    headers.forEach(header => {
      if (header === 'children') {
        row[header] = Array.isArray(attendee[header]) ? attendee[header].join(';') : '';
      } else if (typeof attendee[header] === 'object') {
        row[header] = JSON.stringify(attendee[header]);
      } else {
        row[header] = attendee[header];
      }
    });
    return row;
  });

  // Create CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(header => {
      const cell = row[header] ?? '';
      return typeof cell === 'string' && cell.includes(',') 
        ? `"${cell.replace(/"/g, '""')}"` 
        : cell;
    }).join(','))
  ].join('\n');

  return csvContent;
};

// Extract attendees from the initial data file
const initialData = initialDataFile.attendees || initialDataFile;

export const AttendeeProvider = ({ children }) => {
  const [attendees, setAttendees] = useState([]);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage
  const loadFromStorage = (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error loading data for ${key}:`, error);
      return null;
    }
  };

  // Save data to localStorage
  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving data for ${key}:`, error);
      return false;
    }
  };

  // Clear all stored data
  const clearAllStoredData = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  };

  // Initialize or load existing data
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Try to load existing data
      const storedAttendees = loadFromStorage(STORAGE_KEYS.ATTENDEES);
      
      if (storedAttendees && storedAttendees.length > 0) {
        setAttendees(storedAttendees);
      } else {
        // Initialize with default data if no stored data exists
        await resetToInitial();
      }
    } catch (error) {
      console.error('Error in loadData:', error);
      await resetToInitial();
    } finally {
      setIsLoading(false);
    }
  };

  // Update attendee with automatic storage
  const updateAttendee = (id, updates) => {
    setAttendees(prev => {
      const newAttendees = prev.map(a => 
        a.id === id ? { ...a, ...updates } : a
      );
      saveToStorage(STORAGE_KEYS.ATTENDEES, newAttendees);
      return newAttendees;
    });
  };

  // Update child information
  const updateChild = (attendeeId, originalChildName, updatedChildInfo) => {
    setAttendees(prev => {
      const newAttendees = prev.map(attendee => {
        if (attendee.id === attendeeId) {
          const updatedChildren = attendee.children.map(child => 
            child.name === originalChildName ? { ...child, ...updatedChildInfo } : child
          );
          return { ...attendee, children: updatedChildren };
        }
        return attendee;
      });
      saveToStorage(STORAGE_KEYS.ATTENDEES, newAttendees);
      return newAttendees;
    });
  };

  // Remove child
  const removeChild = (attendeeId, childName) => {
    setAttendees(prev => {
      const newAttendees = prev.map(attendee => {
        if (attendee.id === attendeeId) {
          const updatedChildren = attendee.children.filter(child => child.name !== childName);
          return { ...attendee, children: updatedChildren };
        }
        return attendee;
      });
      saveToStorage(STORAGE_KEYS.ATTENDEES, newAttendees);
      return newAttendees;
    });
  };

  // Add new attendee
  const addAttendee = (newAttendee) => {
    setAttendees(prev => {
      const newAttendees = [...prev, newAttendee];
      saveToStorage(STORAGE_KEYS.ATTENDEES, newAttendees);
      return newAttendees;
    });
  };

  // Reset to initial data
  const resetToInitial = () => {
    try {
      // Clear all stored data first
      clearAllStoredData();
      
      // Reset attendees to initial data
      const processedInitialData = initialData.map(attendee => ({
        ...attendee,
        checkedIn: false,
        verifiedEmail: false,
        verifiedChildren: false
      }));
      
      setAttendees(processedInitialData);
      setSelectedAttendee(null);
      
      // Save the reset data
      saveToStorage(STORAGE_KEYS.ATTENDEES, processedInitialData);
      
      return true;
    } catch (error) {
      console.error('Error resetting data:', error);
      return false;
    }
  };

  // Export verified sessions
  const exportVerifiedSessions = () => {
    const verifiedSessions = attendees
      .filter(a => a.photographyStatus === 'verified')
      .map(a => ({
        name: `${a.firstName} ${a.lastName}`,
        email: a.photographyEmail,
        timeSlot: a.photographyTimeSlot
      }));
    
    if (verifiedSessions.length > 0) {
      const dataStr = JSON.stringify(verifiedSessions, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `verified_sessions_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  // Export attendees to CSV
  const exportAttendeesToCSV = () => {
    try {
      const csvContent = convertToCSV(attendees);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
      const filename = `attendees_export_${timestamp}.csv`;
      
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
      } else {
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      return true;
    } catch (error) {
      console.error('Error exporting attendees:', error);
      return false;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AttendeeContext.Provider
      value={{
        attendees,
        selectedAttendee,
        setSelectedAttendee,
        updateAttendee,
        updateChild,
        removeChild,
        resetToInitial,
        isLoading,
        exportVerifiedSessions,
        exportAttendeesToCSV,
        addAttendee
      }}
    >
      {children}
    </AttendeeContext.Provider>
  );
};
