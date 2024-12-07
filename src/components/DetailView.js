import React from 'react';
import { useDetailView } from '../hooks/useDetailView';
import SchedulingGrid from './SchedulingGrid';
import ChildrenList from './ChildrenList';

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
    handleClose
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

          {/* Time Slot Selection */}
          <div>
            <label className="block font-medium mb-1">Photo Session Time</label>
            <SchedulingGrid
              selectedSlot={formState.selectedTimeSlot}
              onTimeSlotSelect={(time) => handleInputChange('selectedTimeSlot', time)}
            />
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

          {/* Photography Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Photography Session</h3>
            
            {/* Photography Status */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Status</label>
              <select
                value={formState.photographyStatus}
                onChange={(e) => handleInputChange('photographyStatus', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="verified">Verified</option>
                <option value="declined">Declined</option>
              </select>
            </div>

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

            {/* Photography Address */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Delivery Address</label>
              <input
                type="text"
                value={formState.photographyAddress}
                onChange={(e) => handleInputChange('photographyAddress', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter delivery address"
              />
            </div>

            {/* Time Slot Selection */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Time Slot</label>
              <input
                type="text"
                value={formState.photographyTimeSlot}
                onChange={(e) => handleInputChange('photographyTimeSlot', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Select time slot"
              />
            </div>
          </div>

          {/* Children List */}
          {selectedAttendee.children?.length > 0 && (
            <ChildrenList
              attendee={selectedAttendee}
              onVerifyChild={handleVerifyChild}
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
