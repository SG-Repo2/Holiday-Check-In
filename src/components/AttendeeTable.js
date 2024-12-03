import React, { useContext, useState } from 'react';
import { AttendeeContext } from '../AttendeeContext';
import AttendeeRow from './AttendeeRow';
import AddAttendeeForm from './AddAttendeeForm';

const AttendeeTable = () => {
  const { attendees } = useContext(AttendeeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckedIn, setShowCheckedIn] = useState(undefined);
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredAttendees = attendees.filter((attendee) =>
    `${attendee.firstName} ${attendee.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-20 px-4">
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add New Attendee
        </button>
      </div>
      {showAddForm && <AddAttendeeForm onClose={() => setShowAddForm(false)} />}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          placeholder="Search Attendees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className="p-2 border rounded bg-white"
          value={showCheckedIn === undefined ? 'all' : showCheckedIn.toString()}
          onChange={(e) => {
            const value = e.target.value;
            setShowCheckedIn(
              value === 'all' ? undefined : value === 'true'
            );
          }}
        >
          <option value="all">All Attendees</option>
          <option value="true">Checked In</option>
          <option value="false">Not Checked In</option>
        </select>
      </div>
      <div className="max-h-screen overflow-y-auto">
        {filteredAttendees.map((attendee) => (
          <AttendeeRow 
            key={attendee.id} 
            attendee={attendee}
            showCheckedIn={showCheckedIn}
          />
        ))}
      </div>
    </div>
  );
};

export default AttendeeTable;
