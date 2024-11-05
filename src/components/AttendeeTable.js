// src/components/AttendeeTable.js
import React, { useContext, useState } from 'react';
import { AttendeeContext } from '../AttendeeContext';
import AttendeeRow from './AttendeeRow';

const AttendeeTable = () => {
  const { attendees } = useContext(AttendeeContext);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAttendees = attendees.filter((attendee) =>
    `${attendee.firstName} ${attendee.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-20 px-4">
      <input
        type="text"
        className="w-full p-2 mb-4 border rounded"
        placeholder="Search Attendees..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="max-h-screen overflow-y-auto">
        {filteredAttendees.map((attendee) => (
          <AttendeeRow key={attendee.id} attendee={attendee} />
        ))}
      </div>
    </div>
  );
};

export default AttendeeTable;
