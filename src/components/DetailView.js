import React from 'react';
import { useDetailView } from '../hooks/useDetailView';
import SchedulingGrid from './SchedulingGrid';
import ChildrenList from './ChildrenList';
import { TIME_SLOTS, formatTimeSlot } from '../utils/timeSlots';

const DetailView = () => {
  const {
    formState,
    showTimeSlotWarning,
    setShowTimeSlotWarning,
    showConfirmation,
    setShowConfirmation,
    hasUnsavedChanges,
    handleInputChange,
    handleVerifyChild,
    handleSaveChanges,
    handleCheckIn,
    selectedAttendee,
    handleClose,
    handleTimeSlotSelect,
    handleChildUpdate
  } = useDetailView();

  if (!selectedAttendee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-md relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">
            {selectedAttendee.firstName} {selectedAttendee.lastName}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={formState.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter email address"
            />
          </div>

          {/* Time Slot Selection - Optional */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-medium">Photo Session Time</label>
              <span className="text-sm text-gray-500">(Optional)</span>
            </div>
            <div className="space-y-2">
              <select
                value={formState.photographyTimeSlot}
                onChange={(e) => {
                  handleInputChange('photographyTimeSlot', e.target.value);
                  handleTimeSlotSelect(e.target.value);
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Time</option>
                {TIME_SLOTS.map(slot => (
                  <option key={slot.value} value={slot.value}>
                    {slot.display}
                  </option>
                ))}
              </select>
              {!formState.photographyTimeSlot && selectedAttendee.checkedIn && (
                <p className="text-sm text-blue-600">
                  You can schedule photos later by editing this attendee's information.
                </p>
              )}
            </div>
          </div>

          {/* Notes Field */}
          <div>
            <label className="block font-medium mb-1">Notes</label>
            <textarea
              value={formState.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full p-2 border rounded"
              rows="3"
              placeholder="Add notes..."
            />
          </div>

          {/* Photography Section - Only show if time slot is selected or already has photo data */}
          {(formState.photographyTimeSlot || selectedAttendee.photographyStatus) && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Photography Session</h3>
              
              {/* Photography Email */}
              <div className="mb-4">
                <label className="block font-medium mb-1">Photography Email</label>
                <input
                  type="email"
                  value={formState.photographyEmail}
                  onChange={(e) => handleInputChange('photographyEmail', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter email for photography"
                />
              </div>

              {/* Display current status */}
              {selectedAttendee.photographyStatus && (
                <div className="mb-4">
                  <label className="block font-medium mb-1">Current Status</label>
                  <div className={`px-3 py-2 rounded ${
                    selectedAttendee.photographyStatus === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedAttendee.photographyStatus === 'completed' ? 'Photos Completed' : 'Photos Scheduled'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Children List */}
          {selectedAttendee.children?.length > 0 && (
            <ChildrenList
              attendee={selectedAttendee}
              onVerifyChild={handleVerifyChild}
              onUpdateChild={handleChildUpdate}
              verifiedChildren={formState.verifiedChildren}
            />
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            {hasUnsavedChanges && (
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            )}
            
            {!selectedAttendee.checkedIn && (
              <button
                onClick={handleCheckIn}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Check In
              </button>
            )}
          </div>
        </div>

        {/* Warning Modals */}
        {showTimeSlotWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white p-4 rounded shadow-lg">
              <p className="mb-4">Please select a photo session time slot before checking in.</p>
              <button
                onClick={() => setShowTimeSlotWarning(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailView;
