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

  const [formState, setFormState] = useState({
    notes: '',
    email: '',
    selectedTimeSlot: null,
    verifiedChildren: []
  });
  
  const [showTimeSlotWarning, setShowTimeSlotWarning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load initial data when attendee changes
  useEffect(() => {
    if (selectedAttendee) {
      setFormState({
        notes: selectedAttendee.notes || '',
        email: selectedAttendee.email || '',
        selectedTimeSlot: selectedAttendee.photographyTimeSlot || null,
        verifiedChildren: selectedAttendee.children?.filter(child => child.verified) || []
      });
      setHasUnsavedChanges(false);
    }
  }, [selectedAttendee]);

  // Update form state when children are modified
  useEffect(() => {
    if (selectedAttendee?.children) {
      setFormState(prev => ({
        ...prev,
        verifiedChildren: selectedAttendee.children.filter(child => child.verified) || []
      }));
    }
  }, [selectedAttendee?.children]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (!selectedAttendee) return null;

  const handleInputChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleVerifyChild = (child) => {
    if (!formState.verifiedChildren.find(vc => vc.name === child.name)) {
      const newVerifiedChildren = [...formState.verifiedChildren, child];
      handleInputChange('verifiedChildren', newVerifiedChildren);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Update attendee record
      const updatedAttendee = {
        ...selectedAttendee,
        notes: formState.notes,
        email: formState.email,
        photographyTimeSlot: formState.selectedTimeSlot,
        children: selectedAttendee.children?.map(child => ({
          ...child,
          verified: formState.verifiedChildren.some(vc => vc.name === child.name)
        })) || []
      };

      await updateAttendee(selectedAttendee.id, updatedAttendee);

      // Update photo session if time slot is set
      if (formState.selectedTimeSlot) {
        await updatePhotoSession(selectedAttendee.id, {
          timeSlot: formState.selectedTimeSlot,
          email: formState.email,
          notes: formState.notes,
          totalParticipants: 1 + 
            (selectedAttendee.children?.length || 0) + 
            (selectedAttendee.guestNames?.length || 0)
        });
      }

      setHasUnsavedChanges(false);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes. Please try again.');
    }
  };

  const handleCheckIn = async () => {
    if (!formState.selectedTimeSlot) {
      setShowTimeSlotWarning(true);
      return;
    }

    if (!formState.email) {
      alert('Please enter an email address for photo delivery');
      return;
    }

    try {
      const updatedAttendee = {
        ...selectedAttendee,
        checkedIn: true,
        email: formState.email,
        photographyTimeSlot: formState.selectedTimeSlot,
        notes: formState.notes,
        children: selectedAttendee.children?.map(child => ({
          ...child,
          verified: formState.verifiedChildren.some(vc => vc.name === child.name)
        })) || []
      };

      await updateAttendee(selectedAttendee.id, updatedAttendee);
      await updatePhotoSession(selectedAttendee.id, {
        timeSlot: formState.selectedTimeSlot,
        email: formState.email,
        status: 'scheduled',
        totalParticipants: 1 + 
          (selectedAttendee.children?.length || 0) + 
          (selectedAttendee.guestNames?.length || 0)
      });

      setSelectedAttendee(null);
    } catch (error) {
      console.error('Error during check-in:', error);
      alert('Error during check-in. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-md relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">
            {selectedAttendee.firstName} {selectedAttendee.lastName}
          </h2>
          <button
            onClick={() => {
              if (hasUnsavedChanges) {
                if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
                  setSelectedAttendee(null);
                }
              } else {
                setSelectedAttendee(null);
              }
            }}
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
