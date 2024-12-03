// src/components/AttendeeRow.js
import React, { useContext, useState } from 'react';
import { AttendeeContext } from '../AttendeeContext';

const AttendeeRow = ({ attendee, showCheckedIn }) => {
  const { selectedAttendee, setSelectedAttendee, updateAttendee } = useContext(AttendeeContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(attendee);

  const handleClick = () => {
    setSelectedAttendee(attendee);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    updateAttendee(attendee.id, editedData);
    setIsEditing(false);
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setEditedData(attendee);
    setIsEditing(false);
  };

  if (showCheckedIn !== undefined && showCheckedIn !== attendee.checkedIn) {
    return null;
  }

  return (
    <div
      data-testid={`attendee-row-${attendee.id}`}
      onClick={!isEditing ? handleClick : undefined}
      className={`p-4 mb-2 bg-white rounded shadow ${!isEditing ? 'cursor-pointer' : ''} ${
        selectedAttendee?.id === attendee.id ? 'bg-green-100' : ''
      } ${attendee.manualEntry ? 'border-l-4 border-blue-500' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editedData.firstName}
                onChange={(e) => setEditedData({...editedData, firstName: e.target.value})}
                className="border p-1 mr-1 rounded"
              />
              <input
                type="text"
                value={editedData.lastName}
                onChange={(e) => setEditedData({...editedData, lastName: e.target.value})}
                className="border p-1 rounded"
              />
              <input
                type="email"
                value={editedData.email || ''}
                onChange={(e) => setEditedData({...editedData, email: e.target.value})}
                className="border p-1 w-full rounded"
                placeholder="Email"
              />
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold">
                {attendee.firstName} {attendee.lastName}
              </h3>
              <div className="space-y-1">
                <p className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    attendee.checkedIn ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  {attendee.checkedIn ? 'Checked In' : 'Not Checked In'}
                </p>
                {attendee.email && (
                  <p className="text-sm text-gray-600">
                    Email: {attendee.email}
                  </p>
                )}
                {attendee.serviceCenter && (
                  <p 
                    data-testid={`attendee-center-${attendee.id}`}
                    className="text-sm text-gray-600"
                  >
                    Service Center: {attendee.serviceCenter}
                  </p>
                )}
                {attendee.shuttleBus && (
                  <p className="text-sm text-blue-600">
                    Using Shuttle Bus
                  </p>
                )}
                {attendee.guestNames?.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Guests: {attendee.guestNames.join(', ')}
                  </p>
                )}
                {attendee.children?.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Children: {attendee.children.map(child => (
                      <span key={child.name} className={`inline-flex items-center mr-2 ${
                        child.verified ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {child.name} {child.verified ? '✓' : '!'}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col gap-2 items-end">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={handleSave}
                className="text-green-600 hover:text-green-800"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="text-red-600 hover:text-red-800"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      {attendee.manualEntry && (
        <span className="text-xs text-blue-600 ml-2">
          (Manually Added)
        </span>
      )}
    </div>
  );
};

export default AttendeeRow;
