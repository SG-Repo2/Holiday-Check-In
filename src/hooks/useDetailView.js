import { useState, useEffect, useContext } from 'react';
import { AttendeeContext } from '../AttendeeContext';
import { PhotoContext } from '../PhotoContext';

export const useDetailView = () => {
  const {
    selectedAttendee,
    setSelectedAttendee,
    updateAttendee,
    fetchAttendees
  } = useContext(AttendeeContext);

  const { updatePhotoSession } = useContext(PhotoContext);

  const [formState, setFormState] = useState({
    notes: '',
    email: '',
    selectedTimeSlot: null,
    verifiedChildren: [],
    photographyStatus: 'pending',
    photographyEmail: '',
    photographyAddress: '',
    photographyTimeSlot: ''
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
        verifiedChildren: selectedAttendee.children?.filter(child => child.verified) || [],
        photographyStatus: selectedAttendee.photographyStatus || 'pending',
        photographyEmail: selectedAttendee.photographyEmail || selectedAttendee.email || '',
        photographyAddress: selectedAttendee.photographyAddress || '',
        photographyTimeSlot: selectedAttendee.photographyTimeSlot || ''
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

  const handlePhotoSessionUpdate = async () => {
    try {
      const photoData = {
        status: formState.photographyStatus,
        timeSlot: formState.photographyTimeSlot,
        email: formState.photographyEmail,
        address: formState.photographyAddress
      };

      await updatePhotoSession(selectedAttendee.id, photoData);
      setHasUnsavedChanges(false);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error updating photo session:', error);
      // Handle error appropriately
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedAttendee) return;

    try {
      // Update basic attendee info
      await updateAttendee(selectedAttendee.id, {
        notes: formState.notes,
        email: formState.email
      });

      // Update photo session if needed
      if (formState.photographyStatus !== selectedAttendee.photographyStatus ||
          formState.photographyTimeSlot !== selectedAttendee.photographyTimeSlot ||
          formState.photographyEmail !== selectedAttendee.photographyEmail ||
          formState.photographyAddress !== selectedAttendee.photographyAddress) {
        await handlePhotoSessionUpdate();
      }

      setHasUnsavedChanges(false);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error saving changes:', error);
      // Handle error appropriately
    }
  };

  const handleCheckIn = async () => {
    if (!selectedAttendee || !updateAttendee) {
      console.error('Missing required data for check-in');
      return;
    }

    try {
      console.log('Starting check-in process for attendee:', selectedAttendee.id);
      
      const updatedAttendee = {
        ...selectedAttendee, // Preserve existing attendee data
        checkedIn: true,
        email: formState.email,
        photographyTimeSlot: formState.selectedTimeSlot,
        notes: formState.notes,
        children: selectedAttendee.children?.map(child => ({
          ...child,
          verified: formState.verifiedChildren.some(vc => vc.name === child.name)
        })) || []
      };

      console.log('Updating attendee with data:', updatedAttendee);
      
      // Update attendee and wait for completion
      const result = await updateAttendee(selectedAttendee.id, updatedAttendee);
      
      if (!result) {
        throw new Error('Failed to update attendee');
      }
      
      // Refresh attendee list
      await fetchAttendees();
      
      setHasUnsavedChanges(false);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error during check-in:', error);
      throw error; // Re-throw to be handled by caller
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
