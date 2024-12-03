import React, { useState, useContext } from 'react';
import { AttendeeContext } from '../AttendeeContext';
import { PhotoContext } from '../PhotoContext';

const AddAttendeeForm = ({ onClose }) => {
  const { addAttendee } = useContext(AttendeeContext);
  const { updatePhotoSession } = useContext(PhotoContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    serviceCenter: '',
    photographyTimeSlot: '',
    children: [],
    guestNames: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate unique ID
    const newId = `manual-${Date.now()}`;
    
    // Create attendee record
    const newAttendee = {
      ...formData,
      id: newId,
      checkedIn: true,
      manualEntry: true,
      reservation: {
        timestamp: new Date().toISOString(),
        attending: true
      }
    };

    // Add attendee
    addAttendee(newAttendee);

    // Create photo session if time slot selected
    if (formData.photographyTimeSlot) {
      updatePhotoSession(newId, {
        attendeeId: newId,
        timeSlot: formData.photographyTimeSlot,
        email: formData.email,
        totalParticipants: 1 + formData.children.length + formData.guestNames.length
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Attendee</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block mb-1">Email *</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Service Center</label>
            <input
              type="text"
              value={formData.serviceCenter}
              onChange={e => setFormData({...formData, serviceCenter: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Attendee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAttendeeForm; 