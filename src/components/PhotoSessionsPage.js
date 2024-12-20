import React, { useContext, useState } from 'react';
import { AttendeeContext } from '../AttendeeContext';
import { PhotoContext } from '../PhotoContext';
import { validateEmail } from '../utils/validation';
import { formatTimeSlot } from '../utils/timeSlots';

const PhotoSessionRow = ({ attendee, onStatusChange }) => {
  const { updatePhotoSession } = useContext(PhotoContext);
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(attendee.photographyEmail || attendee.email || '');
  const [emailError, setEmailError] = useState('');

  const handleEmailUpdate = async () => {
    // Clear previous error
    setEmailError('');

    // Validate email
    if (!email || !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      await updatePhotoSession(attendee.id, {
        timeSlot: attendee.photographyTimeSlot,
        email: email,
        status: attendee.photographyStatus
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating email:', error);
      setEmailError('Failed to update email. Please try again.');
    }
  };

  const handleStatusToggle = async () => {
    try {
      await updatePhotoSession(attendee.id, {
        timeSlot: attendee.photographyTimeSlot,
        email: attendee.photographyEmail || attendee.email,
        status: attendee.photographyStatus === 'completed' ? 'scheduled' : 'completed'
      });
    } catch (error) {
      console.error('Error updating photo status:', error);
    }
  };

  return (
    <div className="p-4 mb-2 bg-white rounded shadow">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <h3 className="text-lg font-semibold">
            {attendee.firstName} {attendee.lastName}
          </h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Time: {formatTimeSlot(attendee.photographyTimeSlot)}
            </p>
            {isEditing ? (
              <div className="flex-grow mx-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  className={`w-full p-2 border rounded ${emailError ? 'border-red-500' : ''}`}
                  placeholder="Enter email address"
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
                <div className="mt-2 space-x-2">
                  <button
                    onClick={handleEmailUpdate}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEmail(attendee.photographyEmail || attendee.email || '');
                      setEmailError('');
                    }}
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-grow mx-4">
                <p className="text-sm text-gray-600">
                  Email: {attendee.photographyEmail || attendee.email}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="ml-2 text-blue-500 hover:text-blue-600"
                  >
                    Edit
                  </button>
                </p>
              </div>
            )}
            {attendee.serviceCenter && (
              <p className="text-sm text-gray-600">
                Service Center: {attendee.serviceCenter}
              </p>
            )}
            {attendee.children?.length > 0 && (
              <p className="text-sm text-gray-600">
                Children: {attendee.children.map(child => (
                  <span key={child.name} className="inline-flex items-center mr-2">
                    {child.name}
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={handleStatusToggle}
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                attendee.photographyStatus === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {attendee.photographyStatus === 'completed' ? 'Completed' : 'Mark Complete'}
            </button>
          </div>
          <span className="text-xs text-gray-600">
            {attendee.photographyStatus === 'completed' ? 'Photos Taken' : 'Scheduled'}
          </span>
        </div>
      </div>
    </div>
  );
};

const PhotoSessionsPage = () => {
  const { attendees } = useContext(AttendeeContext);
  const [sortBy, setSortBy] = useState('time');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort attendees with photo sessions
  const photoAttendees = attendees
    .filter(attendee => attendee.photographyTimeSlot)
    .filter(attendee => 
      searchQuery === '' ||
      `${attendee.firstName} ${attendee.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.serviceCenter?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'status':
          return (a.photographyStatus || '').localeCompare(b.photographyStatus || '');
        case 'time':
        default:
          return (a.photographyTimeSlot || '').localeCompare(b.photographyTimeSlot || '');
      }
    });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 pt-32">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Photography Sessions</h1>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search sessions..."
              className="border rounded p-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select 
              className="border rounded p-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="time">Sort by Time</option>
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {photoAttendees.map((attendee) => (
            <PhotoSessionRow 
              key={attendee.id} 
              attendee={attendee}
            />
          ))}
        </div>

        {/* Summary section remains the same */}
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Session Summary</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-gray-600">Total Sessions</p>
              <p className="text-xl font-semibold">{photoAttendees.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Completed</p>
              <p className="text-xl font-semibold text-green-600">
                {photoAttendees.filter(a => a.photographyStatus === 'completed').length}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Pending</p>
              <p className="text-xl font-semibold text-yellow-600">
                {photoAttendees.filter(a => a.photographyStatus !== 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoSessionsPage;
