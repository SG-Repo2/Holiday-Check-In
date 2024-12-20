// src/AttendeeContext.js
import React, { createContext, useState, useEffect } from 'react';
import { createAttendee } from './services/api';

export const AttendeeContext = createContext();

const API_BASE_URL = 'https://chiwebdev.com/hydro/server/api';

export const AttendeeProvider = ({ children }) => {
  const [attendees, setAttendees] = useState([]);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch attendees from API
  const fetchAttendees = async () => {
    try {
      console.log('Fetching attendees...');
      const response = await fetch(`${API_BASE_URL}/attendees`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch attendees');
      }
      const data = await response.json();
      console.log('Received data:', data);
      
      // Extract attendees array from wrapped structure and ensure it's always an array
      const attendeesList = Array.isArray(data.attendees) ? data.attendees : [];
      
      // Ensure photo fields are present
      const processedAttendees = attendeesList.map(attendee => ({
        ...attendee,
        photoTime: attendee.photoTime || '',
        isPhotoTaken: attendee.isPhotoTaken || false
      }));
      
      setAttendees(processedAttendees);
      
      // Store in localStorage for persistence
      localStorage.setItem('hydro_attendees', JSON.stringify(processedAttendees));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching attendees:', err);
      
      // Try to load from localStorage if API fails
      const cachedData = localStorage.getItem('hydro_attendees');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setAttendees(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          setAttendees([]);
        }
      } else {
        setAttendees([]);
      }
      
      setError(err.message);
      setLoading(false);
    }
  };

  // Update attendee
  const updateAttendee = async (id, updates) => {
    try {
      console.log('Updating attendee:', id, updates);
      const response = await fetch(`${API_BASE_URL}/attendees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error:', errorData);
        throw new Error(errorData.error || `Failed to update attendee: ${response.status}`);
      }

      const updatedAttendee = await response.json();
      console.log('Server response:', updatedAttendee);
      
      // Verify we got valid data back
      if (!updatedAttendee || !updatedAttendee.id) {
        throw new Error('Invalid response from server');
      }
      
      // Update state and localStorage atomically
      setAttendees(prevAttendees => {
        const newAttendees = prevAttendees.map(att => 
          att.id === id ? { ...att, ...updatedAttendee } : att
        );
        
        // Update localStorage
        try {
          localStorage.setItem('hydro_attendees', JSON.stringify(newAttendees));
          console.log('Updated localStorage with new attendees');
        } catch (e) {
          console.error('Failed to update localStorage:', e);
        }
        
        return newAttendees;
      });
      
      return updatedAttendee;
    } catch (err) {
      console.error('Error updating attendee:', err);
      throw err;
    }
  };

  // Add or update updateChild function
  const updateChild = async (attendeeId, childName, updates) => {
    try {
      const attendee = attendees.find(a => a.id === attendeeId);
      if (!attendee) throw new Error('Attendee not found');

      const updatedChildren = attendee.children.map(child => {
        if (child.name === childName) {
          // Preserve verified status if not explicitly changed
          return { 
            ...child, 
            ...updates,
            verified: updates.verified !== undefined ? updates.verified : child.verified 
          };
        }
        return child;
      });

      const updatedAttendee = await updateAttendee(attendeeId, {
        ...attendee,
        children: updatedChildren
      });

      // Update attendees state immediately
      setAttendees(prev => prev.map(a => 
        a.id === attendeeId ? updatedAttendee : a
      ));

      // If this is the selected attendee, update that too
      if (selectedAttendee?.id === attendeeId) {
        setSelectedAttendee(updatedAttendee);
      }

      return updatedAttendee;
    } catch (error) {
      console.error('Error updating child:', error);
      throw error;
    }
  };

  // Add removeChild function
  const removeChild = async (attendeeId, childName) => {
    try {
      const attendee = attendees.find(a => a.id === attendeeId);
      if (!attendee) throw new Error('Attendee not found');

      const updatedChildren = attendee.children.filter(child => 
        child.name !== childName
      );

      const updatedAttendee = await updateAttendee(attendeeId, {
        ...attendee,
        children: updatedChildren
      });

      setAttendees(prev => prev.map(a => 
        a.id === attendeeId ? updatedAttendee : a
      ));

      return updatedAttendee;
    } catch (error) {
      console.error('Error removing child:', error);
      throw error;
    }
  };

  // Add addAttendee function
  const addAttendee = async (newAttendee) => {
    try {
      console.log('Adding attendee to API:', newAttendee);
      
      // Use the API service instead of direct fetch
      const addedAttendee = await createAttendee(newAttendee);
      
      // Update local state
      setAttendees(prev => [...prev, addedAttendee]);
      
      // Update localStorage
      try {
        const updatedAttendees = [...attendees, addedAttendee];
        localStorage.setItem('hydro_attendees', JSON.stringify(updatedAttendees));
      } catch (e) {
        console.error('Failed to update localStorage:', e);
      }
      
      return addedAttendee;
    } catch (error) {
      console.error('Error in addAttendee:', error);
      throw error;
    }
  };

  // Load initial data
  useEffect(() => {
    // Try to load from localStorage first
    const cachedData = localStorage.getItem('hydro_attendees');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setAttendees(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setAttendees([]);
      }
    } else {
      setAttendees([]);
    }
    
    // Then fetch fresh data from API
    fetchAttendees();
  }, []);

  return (
    <AttendeeContext.Provider value={{
      attendees,
      selectedAttendee,
      setSelectedAttendee,
      updateAttendee,
      fetchAttendees,
      updateChild,
      removeChild,
      addAttendee,
      loading,
      error
    }}>
      {children}
    </AttendeeContext.Provider>
  );
};
