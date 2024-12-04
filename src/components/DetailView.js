import React, { useContext, useState, useEffect } from 'react';
import { AttendeeContext } from '../AttendeeContext';
import { PhotoContext } from '../PhotoContext';
import SchedulingGrid from './SchedulingGrid';
import ChildrenList from './ChildrenList';

const DetailView = () => {
  const {
    selectedAttendee,
    setSelectedAttendee,
    updateAttendee
  } = useContext(AttendeeContext);

  const { updatePhotoSession } = useContext(PhotoContext);

  const [notes, setNotes] = useState('');
  const [verifiedChildren, setVerifiedChildren] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showTimeSlotWarning, setShowTimeSlotWarning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (selectedAttendee) {
      setNotes(selectedAttendee.notes || '');
      setVerifiedChildren(selectedAttendee.children?.filter(child => child.verified) || []);
      setEmail(selectedAttendee.email || '');
    }
  }, [selectedAttendee]);

  if (!selectedAttendee) return null;

  const handleVerifyChild = (child) => {
    if (!verifiedChildren.find(vc => vc.name === child.name)) {
      setVerifiedChildren([...verifiedChildren, child]);
    }
  };

  const handleUpdateChild = (originalName, updatedChild) => {
    const updatedChildren = selectedAttendee.children.map(child => 
      child.name === originalName ? updatedChild : child
    );
    
    const updatedAttendee = {
      ...selectedAttendee,
      children: updatedChildren
    };
    
    updateAttendee(selectedAttendee.id, updatedAttendee);
    setSelectedAttendee(updatedAttendee);
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
    // Create updated attendee object with the current email value
    const updatedAttendee = {
      ...selectedAttendee,
      checkedIn: true,
      photographyTimeSlot: selectedTimeSlot,
      email: email, // Include the current email value
      children: selectedAttendee.children?.map(child => ({
        ...child,
        verified: verifiedChildren.some(vc => vc.name === child.name)
      })) || []
    };

    // Update attendee
    updateAttendee(selectedAttendee.id, updatedAttendee);

    // Update photo session with current email
    updatePhotoSession(selectedAttendee.id, {
      timeSlot: selectedTimeSlot,
      confirmed: true,
      totalParticipants: 1 + (selectedAttendee.children?.length || 0),
      email: email, // Use the current email value
    });

    // Close confirmation and modal
    setShowConfirmation(false);
    setSelectedAttendee(null);
  };

  const handleNotesSave = () => {
    updateAttendee(selectedAttendee.id, { notes });
  };
  const handleEmailUpdate = () => {
    if (email) {
      const updatedAttendee = {
        ...selectedAttendee,
        email: email
      };
      updateAttendee(selectedAttendee.id, updatedAttendee);
      alert('Email updated successfully');
    }
  };

  const handleUpdateCheckedIn = () => {
    const updatedAttendee = {
      ...selectedAttendee,
      email,
      photographyTimeSlot: selectedTimeSlot,
      notes
    };

    updateAttendee(selectedAttendee.id, updatedAttendee);
    updatePhotoSession(selectedAttendee.id, {
      timeSlot: selectedTimeSlot,
      email,
      notes
    });

    setSelectedAttendee(null);
  };

  const emailSection = (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Email Address</h3>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Enter email address"
        />
        <button
          onClick={handleEmailUpdate}
          className="px-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Update
        </button>
      </div>
    </div>
  );

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
        <p className="mb-2">
          <strong>Service Center:</strong> {selectedAttendee.serviceCenter}
        </p>
        <p className="mb-4">
          <strong>Transportation:</strong> {selectedAttendee.transportation}
        </p>
        <p className="mb-4">
          <strong>Reservation Made:</strong> {selectedAttendee.reservation?.timestamp}
        </p>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Photography Time Slot</h3>
          <SchedulingGrid 
            onTimeSlotSelect={(slot) => {
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
            onUpdateChild={handleUpdateChild}
          />
        )}

        {emailSection}

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Notes</h3>
          <div className="flex gap-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1 p-2 border rounded"
              rows="2"
            />
            <button
              onClick={handleNotesSave}
              className="px-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>

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

        {selectedAttendee.checkedIn && (
          <button
            onClick={handleUpdateCheckedIn}
            className="w-full mt-4 p-2 bg-blue-500 text-white rounded"
          >
            Update Information
          </button>
        )}

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
