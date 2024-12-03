import React, { useContext, useState } from 'react';
import { PhotoContext } from '../PhotoContext';
import { AttendeeContext } from '../AttendeeContext';

const PhotoSessionVerification = ({ session, onClose }) => {
  const { updatePhotoSession } = useContext(PhotoContext);
  const { attendees, updateAttendee } = useContext(AttendeeContext);
  const [email, setEmail] = useState(session.email || '');
  const [notes, setNotes] = useState(session.notes || '');

  const attendee = attendees.find(a => a.id === session.attendeeId);

  if (!attendee) return null;

  const handleComplete = () => {
    if (!email) {
      alert('Please enter an email address for photo delivery');
      return;
    }

    // Update photo session
    updatePhotoSession(session.attendeeId, {
      ...session,
      email,
      notes,
      status: 'completed',
      completedAt: new Date().toISOString()
    });

    // Update attendee record
    updateAttendee(session.attendeeId, {
      ...attendee,
      photographyStatus: 'completed',
      photographyEmail: email
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">
            Verify Photo Session
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="font-medium">Attendee</p>
            <p>{attendee.firstName} {attendee.lastName}</p>
          </div>

          <div>
            <p className="font-medium">Time Slot</p>
            <p>{session.timeSlot}</p>
          </div>

          <div>
            <p className="font-medium">Participants</p>
            <p>{session.totalParticipants} total
              {attendee.children?.length > 0 && 
                ` (including ${attendee.children.length} children)`}
            </p>
          </div>

          <div>
            <label className="block font-medium mb-1">
              Email for Photo Delivery
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded"
              rows="3"
              placeholder="Add any notes about the photo session"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Complete Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoSessionVerification; 