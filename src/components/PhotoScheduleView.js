import React, { useContext } from 'react';
import { AttendeeContext } from '../AttendeeContext';
import { formatTimeSlot } from '../utils/timeSlots';

const PhotoScheduleView = () => {
  const { attendees, completePhotoSession } = useContext(AttendeeContext);
  
  // Filter attendees who have scheduled photos
  const scheduledAttendees = attendees.filter(
    attendee => attendee.photographyTimeSlot
  );

  const handleCompleteSession = (attendeeId, email) => {
    completePhotoSession(attendeeId, email);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Photo Sessions</h2>
      <div className="space-y-4">
        {scheduledAttendees.map(attendee => (
          <div key={attendee.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  {attendee.firstName} {attendee.lastName}
                </h3>
                <p className="text-gray-600">
                  Time: {formatTimeSlot(attendee.photographyTimeSlot)}
                </p>
                <p className="text-gray-600">
                  Participants: {(attendee.children?.length || 0) + 1} 
                  {attendee.children?.length > 0 && 
                    ` (including ${attendee.children.length} children)`}
                </p>
              </div>
              <div>
                {attendee.photographyStatus === 'scheduled' && (
                  <button
                    onClick={() => {
                      const email = prompt('Please enter email for photos:');
                      if (email) handleCompleteSession(attendee.id, email);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Complete Session
                  </button>
                )}
                {attendee.photographyStatus === 'completed' && (
                  <div className="text-green-600">
                    ✓ Completed
                    <div className="text-sm text-gray-600">
                      Email: {attendee.photographyEmail}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoScheduleView; 