// src/components/AttendeeRow.js
import React, { useContext, useState } from 'react';
import { AttendeeContext } from '../AttendeeContext';

const AttendeeRow = ({ attendee, showCheckedIn }) => {
  const { selectedAttendee, setSelectedAttendee } = useContext(AttendeeContext);

  const handleClick = () => {
    setSelectedAttendee(attendee);
  };

  // Don't render if filtering by checked in status doesn't match
  if (showCheckedIn !== undefined && showCheckedIn !== attendee.checkedIn) {
    return null;
  }

  return (
    <div
      onClick={handleClick}
      className={`p-4 mb-2 bg-white rounded shadow cursor-pointer ${
        selectedAttendee?.id === attendee.id ? 'bg-green-100' : ''
      } ${
        attendee.checkedIn ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            {attendee.firstName} {attendee.lastName}
          </h3>
          <p className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
              attendee.checkedIn ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            {attendee.checkedIn ? 'Checked In' : 'Not Checked In'}
          </p>
        </div>
        {attendee.children && attendee.children.length > 0 && (
          <div className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
            Has Children
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendeeRow;
