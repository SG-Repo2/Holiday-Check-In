import { useState, useEffect, useContext } from 'react';
import { AttendeeContext } from '../AttendeeContext';
import { PhotoContext } from '../PhotoContext';

export const useDetailView = () => {
  const {
    selectedAttendee,
    setSelectedAttendee,
    updateAttendee,
    fetchAttendees,
    updateChild
  } = useContext(AttendeeContext);

  const { updatePhotoSession } = useContext(PhotoContext);

  const [formState, setFormState] = useState({
    notes: '',
    email: '',
    selectedTimeSlot: null,
    verifiedChildren: [],
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
      const updatedAttendee = {
        notes: formState.notes,
        email: formState.email
      };

      // Handle photo session updates
      if (formState.photographyTimeSlot) {
        await updatePhotoSession(selectedAttendee.id, {
          timeSlot: formState.photographyTimeSlot,
          email: formState.photographyEmail || formState.email,
          status: 'scheduled'
        });

        updatedAttendee.photographyTimeSlot = formState.photographyTimeSlot;
        updatedAttendee.photographyEmail = formState.photographyEmail;
        updatedAttendee.photographyStatus = 'scheduled';
      }

      await updateAttendee(selectedAttendee.id, updatedAttendee);
      setHasUnsavedChanges(false);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes. Please try again.');
    }
  };

  const handleCheckIn = async () => {
    try {
      console.log('Starting check-in process for attendee:', selectedAttendee.id);
      
      const updatedAttendee = {
        checkedIn: true,
        email: formState.email,
        notes: formState.notes,
        children: selectedAttendee.children?.map(child => ({
          ...child,
          verified: formState.verifiedChildren.some(vc => vc.name === child.name)
        })) || []
      };

      // Only include photo session data if a time slot was selected
      if (formState.photographyTimeSlot) {
        // Update photo session first
        await updatePhotoSession(selectedAttendee.id, {
          timeSlot: formState.photographyTimeSlot,
          email: formState.photographyEmail || formState.email,
          status: 'scheduled'
        });
        
        // Add photo session data to attendee update
        updatedAttendee.photographyTimeSlot = formState.photographyTimeSlot;
        updatedAttendee.photographyEmail = formState.photographyEmail;
        updatedAttendee.photographyStatus = 'scheduled';
      }

      console.log('Updating attendee with data:', updatedAttendee);
      
      // Update attendee record
      await updateAttendee(selectedAttendee.id, updatedAttendee);
      
      // Refresh attendee list
      await fetchAttendees();
      
      setHasUnsavedChanges(false);
      setShowConfirmation(true);
      
      // Close the detail view after successful check-in
      setSelectedAttendee(null);
    } catch (error) {
      console.error('Error during check-in:', error);
      alert('Error during check-in. Please try again.');
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

  const handleTimeSlotSelect = async (timeSlot) => {
    if (!selectedAttendee) return;

    try {
      // Update both attendee and photo session
      await updatePhotoSession(selectedAttendee.id, {
        timeSlot,
        email: formState.photographyEmail,
        status: 'scheduled'
      });

      setFormState(prev => ({
        ...prev,
        photographyTimeSlot: timeSlot
      }));

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error updating time slot:', error);
    }
  };

  const handleChildUpdate = async (childName, updatedChild) => {
    try {
      const updatedAttendee = await updateChild(selectedAttendee.id, childName, updatedChild);
      
      // Update the selected attendee with the new data
      setSelectedAttendee(updatedAttendee);
      
      // Update form state with verified children, preserving verification status
      setFormState(prev => ({
        ...prev,
        verifiedChildren: updatedAttendee.children?.filter(child => child.verified) || []
      }));
    } catch (error) {
      console.error('Error updating child:', error);
      alert('Error updating child. Please try again.');
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
    selectedAttendee,
    handleTimeSlotSelect,
    handleChildUpdate
  };
};
