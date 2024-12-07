// Import necessary dependencies from React and custom contexts
import React, { useContext, useState } from 'react';
import { AttendeeContext } from '../AttendeeContext';
import PhotoSessionVerification from './PhotoSessionVerification';
import { PhotoContext } from '../PhotoContext';

// PhotoSessionList component displays a list of photo sessions and allows verification
const PhotoSessionList = () => {
  const { attendees } = useContext(AttendeeContext);
  const { photoSessions } = useContext(PhotoContext);
  const [selectedSession, setSelectedSession] = useState(null);

  // Filter attendees who have photo sessions scheduled
  const scheduledSessions = attendees
    .filter(attendee => attendee.photographyTimeSlot)
    .map(attendee => {
      const session = photoSessions.find(s => s.attendeeId === attendee.id) || {};
      return {
        attendeeId: attendee.id,
        timeSlot: attendee.photographyTimeSlot,
        email: attendee.photographyEmail,
        status: attendee.photographyStatus,
        attendee
      };
    })
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  return (
    <div className="space-y-4">
      {scheduledSessions.map((session) => (
        <div key={session.attendeeId} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">
                {session.attendee.firstName} {session.attendee.lastName}
              </h3>
              <p className="text-gray-600">Time: {session.timeSlot}</p>
              {session.email && (
                <p className="text-gray-600">Email: {session.email}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedSession(session)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              {session.status === 'completed' ? 'View Details' : 'Verify Session'}
            </button>
          </div>
        </div>
      ))}

      {selectedSession && (
        <PhotoSessionVerification
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
};

// Export the component for use in other parts of the application
export default PhotoSessionList; 