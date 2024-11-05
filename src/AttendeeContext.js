// src/AttendeeContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AttendeeContext = createContext();

export const AttendeeProvider = ({ children }) => {
  const [attendees, setAttendees] = useState([]);
  const [selectedAttendee, setSelectedAttendee] = useState(null);

  useEffect(() => {
    // Load attendees from JSON file
    fetch('/attendees.json')
      .then((response) => response.json())
      .then((data) => setAttendees(data));
  }, []);

  const updateAttendee = (id, updatedInfo) => {
    setAttendees((prevAttendees) =>
      prevAttendees.map((attendee) =>
        attendee.id === id ? { ...attendee, ...updatedInfo } : attendee
      )
    );
  };

  const updateChild = (attendeeId, childName, updatedChildInfo) => {
    setAttendees((prevAttendees) =>
      prevAttendees.map((attendee) => {
        if (attendee.id === attendeeId) {
          const updatedChildren = attendee.children.map((child) =>
            child.name === childName ? { ...child, ...updatedChildInfo } : child
          );
          return { ...attendee, children: updatedChildren };
        }
        return attendee;
      })
    );
  };

  const addChild = (attendeeId, newChild) => {
    setAttendees((prevAttendees) =>
      prevAttendees.map((attendee) =>
        attendee.id === attendeeId
          ? { ...attendee, children: [...attendee.children, newChild] }
          : attendee
      )
    );
  };

  const removeChild = (attendeeId, childName) => {
    setAttendees((prevAttendees) =>
      prevAttendees.map((attendee) =>
        attendee.id === attendeeId
          ? {
              ...attendee,
              children: attendee.children.filter((child) => child.name !== childName),
            }
          : attendee
      )
    );
  };

  return (
    <AttendeeContext.Provider
      value={{
        attendees,
        selectedAttendee,
        setSelectedAttendee,
        updateAttendee,
        updateChild,
        addChild,
        removeChild,
      }}
    >
      {children}
    </AttendeeContext.Provider>
  );
};
