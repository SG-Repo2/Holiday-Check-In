// src/AttendeeContext.js
import React, { createContext, useState, useEffect } from 'react';
import { openDB } from 'idb';
import initialData from './attendees2024.json';

export const AttendeeContext = createContext();

const DB_NAME = 'attendeeDB';
const STORE_NAME = 'attendees';
const DB_VERSION = 1;
const STORAGE_KEY = 'persistedAttendees';

export const AttendeeProvider = ({ children }) => {
  const [attendees, setAttendees] = useState([]);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      console.error('Error initializing database:', error);
      return null;
    }
  };

  const persistData = async (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      const db = await initDB();
      if (db) {
        await db.put(STORE_NAME, data, 'current');
      }
    } catch (error) {
      console.error('Error persisting data:', error);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Try localStorage first
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData && parsedData.length > 0) {
          setAttendees(parsedData);
          return;
        }
      }

      // Initialize from initial data if no stored data
      const initialAttendees = initialData.attendees.map(attendee => ({
        ...attendee,
        checkedIn: false,
        photographyStatus: attendee.photographyTimeSlot ? 'scheduled' : undefined,
        photographyEmail: '',
        children: attendee.children?.map(child => ({
          ...child,
          verified: false
        })) || []
      }));
      
      setAttendees(initialAttendees);
      persistData(initialAttendees);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToInitial = () => {
    const initialAttendees = initialData.attendees.map(attendee => ({
      ...attendee,
      checkedIn: false,
      photographyStatus: attendee.photographyTimeSlot ? 'scheduled' : undefined,
      photographyEmail: '',
      children: attendee.children?.map(child => ({
        ...child,
        verified: false
      })) || []
    }));
    
    setAttendees(initialAttendees);
    persistData(initialAttendees);
  };

  const updateAttendee = (id, updates) => {
    setAttendees(prev => {
      const newAttendees = prev.map(a => 
        a.id === id ? { ...a, ...updates } : a
      );
      persistData(newAttendees);
      return newAttendees;
    });
  };

  const addAttendee = (newAttendee) => {
    setAttendees(prev => {
      const newAttendees = [...prev, newAttendee];
      persistData(newAttendees);
      return newAttendees;
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AttendeeContext.Provider
      value={{
        attendees,
        setAttendees,
        selectedAttendee,
        setSelectedAttendee,
        updateAttendee,
        addAttendee,
        resetToInitial,
      }}
    >
      {children}
    </AttendeeContext.Provider>
  );
};
