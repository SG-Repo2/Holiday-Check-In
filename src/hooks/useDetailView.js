import { useState, useEffect, useContext } from 'react';
import { AttendeeContext } from '../AttendeeContext';
import { PhotoContext } from '../PhotoContext';

export const useDetailView = () => {
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
      return true;
    } catch (error) {
      console.error('Error saving changes:', error);
      return false;
    }
  };

  const handleCheckIn = async () => {
    if (!formState.selectedTimeSlot) {
      setShowTimeSlotWarning(true);
      return false;
    }

    if (!formState.email) {
      return false;
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
      return true;
    } catch (error) {
      console.error('Error during check-in:', error);
      return false;
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setSelectedAttendee(null);
      }
    } else {
      setSelectedAttendee(null);
    }
  };

  return {
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
    handleClose,
    selectedAttendee
  };
};
