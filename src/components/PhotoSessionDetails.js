import React, { useContext, useState } from 'react';
import { PhotoContext } from '../PhotoContext';
import { AttendeeContext } from '../AttendeeContext';

const PhotoSessionDetails = () => {
  const { selectedAttendee } = useContext(AttendeeContext);
  const { photoSessions, updatePhotoSession } = useContext(PhotoContext);
  const [email, setEmail] = useState('');

  if (!selectedAttendee) {
    return (
      <div className="bg-gray-50 p-4 rounded">
        <p className="text-gray-500">Select an attendee to view session details</p>
      </div>
    );
  }

  const session = photoSessions.find(p => p.attendeeId === selectedAttendee.id);

  const handleConfirm = () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }
    
    updatePhotoSession(selectedAttendee.id, {
      email,
      confirmed: true
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Session Details</h3>
      
      <div className="space-y-4">
        <div>
          <p className="font-medium">Primary Contact</p>
          <p>{selectedAttendee.firstName} {selectedAttendee.lastName}</p>
          <p className="text-sm text-gray-600">
            Service Center: {selectedAttendee.serviceCenter}
          </p>
          {selectedAttendee.shuttleBus && (
            <p className="text-sm text-blue-600">Using Shuttle Bus</p>
          )}
        </div>

        {selectedAttendee.guestNames?.length > 0 && (
          <div>
            <p className="font-medium">Guests</p>
            <ul className="list-disc list-inside">
              {selectedAttendee.guestNames.map(guest => (
                <li key={guest}>{guest}</li>
              ))}
            </ul>
          </div>
        )}

        {selectedAttendee.children?.length > 0 && (
          <div>
            <p className="font-medium">Children in Photo</p>
            <ul className="list-disc list-inside">
              {selectedAttendee.children.map(child => (
                <li key={child.name} className={child.verified ? 'text-green-600' : 'text-red-600'}>
                  {child.name} ({child.age}) {child.verified ? '✓' : '!'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {session?.timeSlot && (
          <div>
            <p className="font-medium">Scheduled Time</p>
            <p>{session.timeSlot}</p>
          </div>
        )}

        {selectedAttendee.additionalInfo?.wantsPortrait && (
          <div className="bg-blue-100 p-2 rounded">
            <p className="font-medium text-blue-800">✓ Requested Portrait Session</p>
          </div>
        )}

        <div>
          <label className="block font-medium mb-2">Email for Photos</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter email address"
          />
        </div>

        <button
          onClick={handleConfirm}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Confirm Email
        </button>
      </div>
    </div>
  );
};

export default PhotoSessionDetails; 