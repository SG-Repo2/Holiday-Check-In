import React, { useState, useContext } from 'react';
import { AttendeeContext } from '../AttendeeContext';
import { PhotoContext } from '../PhotoContext';
import { TIME_SLOTS, formatTimeSlot } from '../utils/timeSlots';

const AddAttendeeForm = ({ onClose }) => {
  const { addAttendee } = useContext(AttendeeContext);
  const { updatePhotoSession } = useContext(PhotoContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    serviceCenter: '',
    photographyTimeSlot: '',
    photographyEmail: '',
    notes: '',
    children: [],
    guestNames: []
  });

  const [newChild, setNewChild] = useState({ name: '', age: '', gender: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddChild = () => {
    if (!newChild.name || !newChild.age || !newChild.gender) {
      alert('Please fill in all child fields');
      return;
    }

    setFormData(prev => ({
      ...prev,
      children: [...prev.children, { ...newChild, verified: false }]
    }));
    setNewChild({ name: '', age: '', gender: '' }); // Reset child form
  };

  const handleRemoveChild = (childName) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.filter(child => child.name !== childName)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!formData.firstName || !formData.lastName) {
        throw new Error('First and last name are required');
      }

      // Generate unique ID
      const newId = `manual-${Date.now()}`;
      
      // Create attendee record with proper structure
      const newAttendee = {
        id: newId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || null,
        serviceCenter: formData.serviceCenter?.trim() || '',
        notes: formData.notes?.trim() || '',
        checkedIn: true,
        manualEntry: true,
        children: formData.children.map(child => ({
          name: child.name.trim(),
          age: parseInt(child.age),
          gender: child.gender,
          verified: false
        })),
        photographyTimeSlot: formData.photographyTimeSlot || null,
        photographyEmail: formData.photographyEmail?.trim() || formData.email?.trim() || null,
        photographyStatus: formData.photographyTimeSlot ? 'scheduled' : null,
        reservation: {
          timestamp: new Date().toISOString(),
          attending: true
        }
      };

      console.log('Submitting new attendee:', newAttendee);

      // Add attendee first
      const result = await addAttendee(newAttendee);
      
      if (!result) {
        throw new Error('Failed to add attendee - no response from server');
      }

      // Create photo session if time slot selected
      if (formData.photographyTimeSlot) {
        try {
          await updatePhotoSession(newId, {
            attendeeId: newId,
            timeSlot: formData.photographyTimeSlot,
            email: formData.photographyEmail?.trim() || formData.email?.trim() || null,
            status: 'scheduled',
            totalParticipants: 1 + formData.children.length
          });
        } catch (photoError) {
          console.error('Error creating photo session:', photoError);
          // Continue with form submission even if photo session fails
        }
      }

      onClose();
    } catch (error) {
      console.error('Error adding attendee:', error);
      alert(`Error adding attendee: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add New Attendee</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div>
            <label className="block mb-1">First Name *</label>
            <input
              required
              type="text"
              value={formData.firstName}
              onChange={e => setFormData({...formData, firstName: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Last Name *</label>
            <input
              required
              type="text"
              value={formData.lastName}
              onChange={e => setFormData({...formData, lastName: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full p-2 border rounded"
              placeholder="Optional"
            />
          </div>

          {/* Photography Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-2">Photography Session (Optional)</h3>
            <div className="space-y-3">
              <div>
                <label className="block mb-1">Photo Time</label>
                <select
                  value={formData.photographyTimeSlot}
                  onChange={e => setFormData({...formData, photographyTimeSlot: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Time</option>
                  {TIME_SLOTS.map(slot => (
                    <option key={slot.value} value={slot.value}>
                      {formatTimeSlot(slot.value)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Photography Email</label>
                <input
                  type="email"
                  value={formData.photographyEmail}
                  onChange={e => setFormData({...formData, photographyEmail: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Leave blank to use main email"
                />
              </div>
            </div>
          </div>

          {/* Children Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-2">Children</h3>
            {formData.children.length > 0 && (
              <div className="mb-3">
                <h4 className="font-medium mb-2">Added Children:</h4>
                {formData.children.map((child, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded mb-1">
                    <span>{child.name} ({child.age}, {child.gender})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChild(child.name)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-2">
              <input
                type="text"
                value={newChild.name}
                onChange={e => setNewChild({...newChild, name: e.target.value})}
                placeholder="Child's Name"
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                value={newChild.age}
                onChange={e => setNewChild({...newChild, age: e.target.value})}
                placeholder="Age"
                min="0"
                max="18"
                className="w-full p-2 border rounded"
              />
              <select
                value={newChild.gender}
                onChange={e => setNewChild({...newChild, gender: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <button
                type="button"
                onClick={handleAddChild}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Add Child
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Attendee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAttendeeForm; 