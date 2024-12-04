import React, { useContext } from 'react';
import { AttendeeContext } from '../AttendeeContext';
import AttendeeRow from './AttendeeRow';
import AddAttendeeForm from './AddAttendeeForm';
import { useAttendeeFilter } from '../hooks/useAttendeeFilter';

const AttendeeTable = () => {
  const { attendees } = useContext(AttendeeContext);
  const {
    searchQuery,
    showCheckedIn,
    showAddForm,
    filteredAttendees,
    handleSearchChange,
    handleStatusChange,
    toggleAddForm
  } = useAttendeeFilter(attendees);

  return (
    <div className="pt-20 px-4">
      <div className="flex justify-between mb-4">
        <button
          onClick={() => toggleAddForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add New Attendee
        </button>
      </div>
      {showAddForm && <AddAttendeeForm onClose={() => toggleAddForm(false)} />}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          placeholder="Search Attendees..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <select 
          className="p-2 border rounded bg-white"
          value={showCheckedIn === undefined ? 'all' : showCheckedIn.toString()}
          onChange={handleStatusChange}
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
