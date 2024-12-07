import React, { useContext } from 'react';
import { AttendeeContext } from '../AttendeeContext';

const PhotoSessionsPage = () => {
  const { attendees, updateAttendee } = useContext(AttendeeContext);

  const handlePhotoTimeChange = async (attendee, newTime) => {
    try {
      await updateAttendee(attendee.id, {
        ...attendee,
        photoTime: newTime
      });
    } catch (error) {
      console.error('Error updating photo time:', error);
    }
  };

  const handlePhotoTakenChange = async (attendee) => {
    try {
      await updateAttendee(attendee.id, {
        ...attendee,
        isPhotoTaken: !attendee.isPhotoTaken
      });
    } catch (error) {
      console.error('Error updating photo taken status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 pt-32">
        <h1 className="text-2xl font-bold mb-6">Photography Sessions</h1>
        <div className="space-y-4">
          {attendees.map((attendee) => (
            <div key={attendee.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {attendee.firstName} {attendee.lastName}
                  </h3>
                </div>
                <div className="space-y-2">
                  <input
                    type="time"
                    value={attendee.photoTime || ''}
                    onChange={(e) => handlePhotoTimeChange(attendee, e.target.value)}
                    className="border rounded p-2"
                  />
                  <button
                    onClick={() => handlePhotoTakenChange(attendee)}
                    className={`ml-2 px-4 py-2 rounded ${
                      attendee.isPhotoTaken
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {attendee.isPhotoTaken ? 'Photo Taken' : 'Mark as Taken'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoSessionsPage;
