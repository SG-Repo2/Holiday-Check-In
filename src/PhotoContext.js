import React, { createContext, useState, useContext, useEffect } from 'react';
import { AttendeeContext } from './AttendeeContext';
import { openDB } from 'idb';

export const PhotoContext = createContext();

export const PhotoProvider = ({ children }) => {
  const [photoSessions, setPhotoSessions] = useState([]);
  const { attendees, updateAttendee } = useContext(AttendeeContext);

  const updatePhotoSession = async (attendeeId, sessionData) => {
    try {
      // Update attendee record with photo session data
      const attendee = attendees.find(a => a.id === attendeeId);
      if (!attendee) throw new Error('Attendee not found');

      const updatedAttendee = await updateAttendee(attendeeId, {
        ...attendee,
        photographyTimeSlot: sessionData.timeSlot,
        photographyEmail: sessionData.email,
        photographyStatus: sessionData.status || 'scheduled'
      });

      // Update local photo sessions state
      setPhotoSessions(prev => {
        const newSessions = [...prev];
        const index = newSessions.findIndex(s => s.attendeeId === attendeeId);
        const updatedSession = { 
          attendeeId,
          timeSlot: sessionData.timeSlot,
          email: sessionData.email,
          status: sessionData.status || 'scheduled',
          updatedAt: new Date().toISOString()
        };
        
        if (index >= 0) newSessions[index] = updatedSession;
        else newSessions.push(updatedSession);
        
        return newSessions;
      });

      return true;
    } catch (error) {
      console.error('Error updating photo session:', error);
      throw error;
    }
  };

  return (
    <PhotoContext.Provider value={{
      photoSessions,
      updatePhotoSession
    }}>
      {children}
    </PhotoContext.Provider>
  );
};