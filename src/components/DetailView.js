// src/components/DetailView.js
import React, { useContext, useState, useEffect } from 'react';
import { AttendeeContext } from '../AttendeeContext';
import SchedulingGrid from './SchedulingGrid';
import ChildrenList from './ChildrenList';

const DetailView = () => {
  const {
    selectedAttendee,
    setSelectedAttendee,
    updateAttendee,
  } = useContext(AttendeeContext);

  const [notes, setNotes] = useState('');
  const [verifiedChildren, setVerifiedChildren] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showTimeSlotWarning, setShowTimeSlotWarning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (selectedAttendee) {
      setNotes(selectedAttendee.notes || '');
      setVerifiedChildren(selectedAttendee.children?.filter(child => child.verified) || []);
    }
  }, [selectedAttendee]);

  if (!selectedAttendee) return null;

  const handleVerifyChild = (child) => {
    if (!verifiedChildren.find(vc => vc.name === child.name)) {
      setVerifiedChildren([...verifiedChildren, child]);
    }
  };

  const handleCheckInAttempt = () => {
    // Prevent checking in if already checked in
    if (selectedAttendee.checkedIn) {
      return;
    }

    // Warn about missing time slot
    if (!selectedTimeSlot) {
      setShowTimeSlotWarning(true);
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmCheckIn = () => {
    // Log the time slot to verify it's being captured
    console.log('Selected time slot:', selectedTimeSlot);

    // Create updated attendee object
    const updatedAttendee = {
      ...selectedAttendee,
      checkedIn: true,
      photographyTimeSlot: selectedTimeSlot,
      children: selectedAttendee.children?.map(child => ({
        ...child,
        verified: verifiedChildren.some(vc => vc.name === child.name)
      })) || []
    };

    // Update attendee
    updateAttendee(selectedAttendee.id, updatedAttendee);

    // Close confirmation and modal
    setShowConfirmation(false);
    setSelectedAttendee(null);  // This will return to table view
  };

  const handleNotesSave = () => {
    updateAttendee(selectedAttendee.id, { notes });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          className="text-red-600 font-bold absolute top-2 right-2"
          onClick={() => setSelectedAttendee(null)}
        >
          &times;
        </button>
        <h2 className="text-xl mb-4">
          {selectedAttendee.firstName} {selectedAttendee.lastName}
        </h2>
        <p className="mb-2">
          <strong>Guest Name:</strong> {selectedAttendee.guestName || 'N/A'}
        </p>
        <p className="mb-4">
          <strong>Service Center:</strong> {selectedAttendee.serviceCenter}
        </p>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Photography Time Slot</h3>
          <SchedulingGrid 
            onTimeSlotSelect={(slot) => {
              console.log('Time slot selected:', slot);
              setSelectedTimeSlot(slot);
              setShowTimeSlotWarning(false);
            }}
            selectedSlot={selectedTimeSlot}
          />
          {showTimeSlotWarning && (
            <p className="text-yellow-600 mt-2">
              Please select a photography time slot.
            </p>
          )}
          {selectedTimeSlot && (
            <p className="text-green-600 mt-2">
              Selected time: {selectedTimeSlot}
            </p>
          )}
        </div>

        {selectedAttendee.children && selectedAttendee.children.length > 0 && (
          <ChildrenList 
            attendee={selectedAttendee} 
            onVerifyChild={handleVerifyChild}
            verifiedChildren={verifiedChildren}
          />
        )}

        <button
          onClick={handleCheckInAttempt}
          className={`w-full mt-6 p-2 rounded ${
            selectedAttendee.checkedIn
              ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
          disabled={selectedAttendee.checkedIn}
        >
          {selectedAttendee.checkedIn ? 'Checked In' : 'Check In'}
        </button>

        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white p-6 rounded shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Confirm Check-In</h3>
              <p>Are you sure you want to check in this attendee?</p>
              {!selectedTimeSlot && (
                <p className="text-yellow-600 mt-2">
                  No photography time slot selected
                </p>
              )}
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={handleConfirmCheckIn}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailView;
