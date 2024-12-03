// Import necessary dependencies from React and custom contexts
import React, { useContext, useState } from 'react';
import { PhotoContext } from '../PhotoContext';
import { AttendeeContext } from '../AttendeeContext';
import PhotoSessionVerification from './PhotoSessionVerification';

// PhotoSessionList component displays a list of photo sessions and allows verification
const PhotoSessionList = () => {
  // Get photo sessions data from PhotoContext
  const { photoSessions } = useContext(PhotoContext);
  // Get attendees data from AttendeeContext
  const { attendees } = useContext(AttendeeContext);
  // State to track which session is currently selected for verification
  const [selectedSession, setSelectedSession] = useState(null);

  // Helper function to find attendee info by ID
  const getAttendeeInfo = (attendeeId) => {
    return attendees.find(a => a.id === attendeeId);
  };

  return (
    // Container for the list with vertical spacing between items
    <div className="space-y-4">
      {/* Map through all photo sessions to create session cards */}
      {photoSessions.map((session) => {
        // Get attendee information for this session
        const attendee = getAttendeeInfo(session.attendeeId);
        // Skip rendering if attendee info not found
        if (!attendee) return null;

        const totalParticipants = 1 + 
          (attendee.children?.length || 0) + 
          (attendee.guestNames?.length || 0);

        return (
          // Individual session card with white background and shadow
          <div key={session.attendeeId} className="bg-white p-4 rounded-lg shadow">
            {/* Flex container for session details and action button */}
            <div className="flex justify-between items-start">
              {/* Left side: Session and attendee information */}
              <div className="space-y-2">
                {/* Attendee name header */}
                <h3 className="text-lg font-semibold">
                  {attendee.firstName} {attendee.lastName}
                </h3>
                {/* Scheduled time slot */}
                <p className="text-gray-600">Time: {session.timeSlot}</p>
                {/* Service center */}
                <p className="text-gray-600">
                  Service Center: {attendee.serviceCenter}
                </p>
                {/* Shuttle bus */}
                {attendee.shuttleBus && (
                  <p className="text-blue-600 text-sm">Using Shuttle Bus</p>
                )}
                {/* Total participants */}
                <p className="text-gray-600">
                  Total Participants: {totalParticipants}
                  {attendee.children?.length > 0 && 
                    ` (including ${attendee.children.length} children)`}
                  {attendee.guestNames?.length > 0 &&
                    ` (with ${attendee.guestNames.length} guests)`}
                </p>
                {/* Display email if provided */}
                {session.email && (
                  <p className="text-gray-600">Email: {session.email}</p>
                )}
                {/* Requested portrait session */}
                {attendee.additionalInfo?.wantsPortrait && (
                  <p className="text-blue-600">Requested Portrait Session</p>
                )}
              </div>
              {/* Right side: Session status or verification button */}
              <div>
                {/* Show completed status or verify button based on session status */}
                {session.status === 'completed' ? (
                  // Green badge for completed sessions
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                    ✓ Completed
                  </span>
                ) : (
                  // Button to trigger verification modal
                  <button
                    onClick={() => setSelectedSession(session)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Verify Photos
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Render verification modal if a session is selected */}
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