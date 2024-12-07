import React, { createContext, useState, useContext, useEffect } from 'react';
import { AttendeeContext } from './AttendeeContext';
import { openDB } from 'idb';

export const PhotoContext = createContext();

export const PhotoProvider = ({ children }) => {
  const [photoSessions, setPhotoSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { attendees } = useContext(AttendeeContext);

  const STORAGE_KEY = 'photoSessions';
  const DB_NAME = 'photoSessionsDB';
  const STORE_NAME = 'sessions';
  const DB_VERSION = 1;

  const initDB = async () => {
    try {
      return await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        },
      });
    } catch (error) {
      console.error('Error initializing photo sessions database:', error);
      return null;
    }
  };

  const persistPhotoSessions = async (sessions) => {
    try {
      // Save to IndexedDB
      const db = await initDB();
      if (db) {
        await db.put(STORE_NAME, sessions, 'current');
      }
      
      // Save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      localStorage.setItem(`${STORAGE_KEY}_lastUpdate`, new Date().toISOString());
      
      return true;
    } catch (error) {
      console.error('Error persisting photo sessions:', error);
      return false;
    }
  };

  // Load stored sessions
  useEffect(() => {
    const loadPhotoSessions = async () => {
      try {
        setIsLoading(true);
        
        // Try IndexedDB first
        const db = await initDB();
        if (db) {
          const dbData = await db.get(STORE_NAME, 'current');
          if (dbData) {
            // Convert from old object format if necessary
            const sessions = Array.isArray(dbData) ? dbData : Object.values(dbData);
            setPhotoSessions(sessions);
            return;
          }
        }
        
        // Fallback to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedData = JSON.parse(stored);
          // Convert from old object format if necessary
          const sessions = Array.isArray(parsedData) ? parsedData : Object.values(parsedData);
          setPhotoSessions(sessions);
        } else {
          setPhotoSessions([]);
        }
      } catch (error) {
        console.error('Error loading photo sessions:', error);
        setPhotoSessions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPhotoSessions();
  }, []); // Empty dependency array for initial load only

  // Sync with attendees
  useEffect(() => {
    if (!attendees.length || isLoading) return;

    setPhotoSessions(prev => {
      const newSessions = [...prev];
      let hasChanges = false;

      // Add or update sessions for attendees with photography data
      attendees.forEach(attendee => {
        if (attendee.photographyStatus && !newSessions.find(p => p.attendeeId === attendee.id)) {
          newSessions.push({
            attendeeId: attendee.id,
            timeSlot: attendee.photographyTimeSlot || '',
            email: attendee.photographyEmail || attendee.email || '',
            address: attendee.photographyAddress || '',
            status: attendee.photographyStatus,
            totalParticipants: 1 + (attendee.children?.length || 0) + (attendee.guestNames?.length || 0),
            createdAt: new Date().toISOString(),
            lastSyncedAt: new Date().toISOString()
          });
          hasChanges = true;
        }
      });

      // Remove sessions for attendees that no longer exist
      const validIds = attendees.map(a => a.id);
      const toRemove = newSessions.filter(session => !validIds.includes(session.attendeeId));
      if (toRemove.length > 0) {
        toRemove.forEach(session => {
          const index = newSessions.findIndex(s => s.attendeeId === session.attendeeId);
          if (index >= 0) {
            newSessions.splice(index, 1);
            hasChanges = true;
          }
        });
      }

      if (hasChanges) {
        persistPhotoSessions(newSessions);
      }
      return newSessions;
    });
  }, [attendees, isLoading]);

  const updatePhotoSession = async (attendeeId, sessionData) => {
    try {
      const API_BASE_URL = 'https://chiwebdev.com/hydro/server/api';
      console.log('Updating photo session on server:', {
        attendeeId,
        sessionData,
        url: `${API_BASE_URL}/attendees/${attendeeId}`
      });
      
      const requestBody = {
        photographyStatus: sessionData.status || 'scheduled',
        photographyTimeSlot: sessionData.timeSlot || '',
        photographyEmail: sessionData.email || '',
        photographyAddress: sessionData.address || ''
      };
      
      console.log('Request body:', requestBody);
      
      // First update the server
      const response = await fetch(`${API_BASE_URL}/attendees/${attendeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error('Failed to update photo session on server');
      }

      const updatedData = await response.json();
      console.log('Server response:', updatedData);

      // Then update local state
      setPhotoSessions(prev => {
        const newSessions = [...prev];
        const existingIndex = newSessions.findIndex(s => s.attendeeId === attendeeId);
        const updatedSession = {
          attendeeId,
          timeSlot: sessionData.timeSlot || '',
          email: sessionData.email || '',
          status: sessionData.status || 'scheduled',
          totalParticipants: sessionData.totalParticipants || 1,
          lastUpdated: new Date().toISOString()
        };

        if (existingIndex >= 0) {
          newSessions[existingIndex] = updatedSession;
        } else {
          newSessions.push(updatedSession);
        }

        return newSessions;
      });

      return true;
    } catch (error) {
      console.error('Error updating photo session:', error);
      throw error;
    }
  };

  const resetPhotoSessions = async () => {
    try {
      // Clear IndexedDB
      const db = await initDB();
      if (db) {
        await db.clear(STORE_NAME);
      }
      
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(`${STORAGE_KEY}_lastUpdate`);
      
      // Reset state
      setPhotoSessions([]);
      return true;
    } catch (error) {
      console.error('Error resetting photo sessions:', error);
      return false;
    }
  };

  if (isLoading) {
    return <div>Loading photo sessions...</div>;
  }

  return (
    <PhotoContext.Provider value={{
      photoSessions,
      setPhotoSessions,
      isLoading,
      updatePhotoSession,
      resetPhotoSessions
    }}>
      {children}
    </PhotoContext.Provider>
  );
};