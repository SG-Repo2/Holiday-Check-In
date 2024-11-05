// src/components/AttendeeRow.js
import React, { useContext } from 'react';
import { AttendeeContext } from '../AttendeeContext';

const AttendeeRow = ({ attendee }) => {
  const { selectedAttendee, setSelectedAttendee } = useContext(AttendeeContext);

  const handleClick = () => {
    setSelectedAttendee(attendee);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 mb-2 bg-white rounded shadow cursor-pointer ${
        selectedAttendee?.id === attendee.id ? 'bg-green-100' : ''
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            {attendee.firstName} {attendee.lastName}
          </h3>
          <p>{attendee.checkedIn ? 'Checked In' : 'Not Checked In'}</p>
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
