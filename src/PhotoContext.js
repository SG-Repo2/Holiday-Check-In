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

      // Add sessions for attendees with photography time slots
      attendees.forEach(attendee => {
        if (attendee.photographyTimeSlot && !newSessions.find(p => p.attendeeId === attendee.id)) {
          newSessions.push({
            attendeeId: attendee.id,
            timeSlot: attendee.photographyTimeSlot,
            email: attendee.email || '',
            totalParticipants: 1 + (attendee.children?.length || 0) + (attendee.guestNames?.length || 0),
            status: 'scheduled',
            createdAt: new Date().toISOString()
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
    setPhotoSessions(prev => {
      const newSessions = [...prev];
      const existingIndex = newSessions.findIndex(s => s.attendeeId === attendeeId);
      
      if (existingIndex >= 0) {
        newSessions[existingIndex] = {
          ...newSessions[existingIndex],
          ...sessionData,
          updatedAt: new Date().toISOString()
        };
      } else {
        newSessions.push({
          attendeeId,
          ...sessionData,
          createdAt: new Date().toISOString()
        });
      }
      
      persistPhotoSessions(newSessions);
      return newSessions;
    });
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