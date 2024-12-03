import React, { createContext, useState, useContext, useEffect } from 'react';
import { AttendeeContext } from './AttendeeContext';

export const PhotoContext = createContext();

export const PhotoProvider = ({ children }) => {
  const [photoSessions, setPhotoSessions] = useState([]);
  const { attendees } = useContext(AttendeeContext);

  // Load stored sessions
  useEffect(() => {
    const loadPhotoSessions = () => {
      try {
        const stored = localStorage.getItem('photoSessions');
        if (stored) {
          setPhotoSessions(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading photo sessions:', error);
        setPhotoSessions([]);
      }
    };

    loadPhotoSessions();
  }, []); // Empty dependency array for initial load only

  // Sync with attendees
  useEffect(() => {
    if (!attendees.length) return;

    setPhotoSessions(prev => {
      const newSessions = [...prev];
      let hasChanges = false;

      attendees.forEach(attendee => {
        if (attendee.photographyTimeSlot && !newSessions.find(p => p.attendeeId === attendee.id)) {
          newSessions.push({
            attendeeId: attendee.id,
            timeSlot: attendee.photographyTimeSlot,
            email: attendee.email,
            totalParticipants: 1 + (attendee.children?.length || 0)
          });
          hasChanges = true;
        }
      });

      if (hasChanges) {
        localStorage.setItem('photoSessions', JSON.stringify(newSessions));
      }
      return newSessions;
    });
  }, [attendees]);

  const updatePhotoSession = (attendeeId, sessionData) => {
    setPhotoSessions(prev => {
      const newSessions = [...prev];
      const existingIndex = newSessions.findIndex(s => s.attendeeId === attendeeId);
      
      if (existingIndex >= 0) {
        newSessions[existingIndex] = {
          ...newSessions[existingIndex],
          ...sessionData
        };
      } else {
        newSessions.push({
          attendeeId,
          ...sessionData
        });
      }
      
      localStorage.setItem('photoSessions', JSON.stringify(newSessions));
      return newSessions;
    });
  };

  return (
    <PhotoContext.Provider value={{
      photoSessions,
      setPhotoSessions,
      updatePhotoSession
    }}>
      {children}
    </PhotoContext.Provider>
  );
}; 