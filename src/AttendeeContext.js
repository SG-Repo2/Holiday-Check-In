// src/AttendeeContext.js
import React, { createContext, useState, useEffect } from 'react';
import initialData from './attendees2024.json';

export const AttendeeContext = createContext();

// Storage keys for different types of data
const STORAGE_KEYS = {
  ATTENDEES: 'hydro_holiday_attendees',
  PHOTO_SESSIONS: 'hydro_holiday_photo_sessions',
  VERIFIED_CHILDREN: 'hydro_holiday_verified_children',
  VERIFIED_EMAILS: 'hydro_holiday_verified_emails'
};

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
  const resetToInitial = async () => {
    // Clear all stored data first
    clearAllStoredData();
    
    // Reset to initial data from JSON file
    const initialAttendees = initialData.attendees.map(attendee => ({
      ...attendee,
      checkedIn: false,
      photographyStatus: attendee.photographyTimeSlot ? 'scheduled' : undefined,
      photographyEmail: '',
      emailVerified: false,
      childrenVerified: false,
      children: attendee.children?.map(child => ({
        ...child,
        verified: false
      })) || []
    }));
    
    setAttendees(initialAttendees);
    saveToStorage(STORAGE_KEYS.ATTENDEES, initialAttendees);
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

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AttendeeContext.Provider value={{
      attendees,
      selectedAttendee,
      setSelectedAttendee,
      updateAttendee,
      updateChild,
      removeChild,
      resetToInitial,
      isLoading,
      exportVerifiedSessions,
      addAttendee
    }}>
      {children}
    </AttendeeContext.Provider>
  );
};
