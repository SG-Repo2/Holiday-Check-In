// src/components/SearchBar.js
import React, { useContext } from 'react';
import { AttendeeContext } from '../AttendeeContext';

const SearchBar = () => {
  const { attendees, setAttendees } = useContext(AttendeeContext);

  return (
    <div className="fixed top-0 w-full bg-red-600 p-4 shadow-md z-10">
      <h1 className="text-white text-2xl text-center">Holiday Party Check-In</h1>
    </div>
  );
};

export default SearchBar;
