import React, { useState, useContext } from 'react';
import { PhotoContext } from '../PhotoContext';
import { AttendeeContext } from '../AttendeeContext';
import DetailView from './DetailView';
import PhotoSessionList from './PhotoSessionList';
import PhotoSessionCalendarView from './PhotoSessionCalendarView';

const PhotoSessionsPage = () => {
  const [viewMode, setViewMode] = useState('list');
  const { selectedAttendee, attendees } = useContext(AttendeeContext);
  const { photoSessions, updatePhotoSession } = useContext(PhotoContext);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Photography Sessions</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded ${
              viewMode === 'list'
                ? 'bg-hydro-blue text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded ${
              viewMode === 'calendar'
                ? 'bg-hydro-blue text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Calendar View
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        {viewMode === 'list' ? (
          <PhotoSessionList />
        ) : (
          <PhotoSessionCalendarView />
        )}
      </div>
      
      {selectedAttendee && <DetailView />}
    </div>
  );
};

export default PhotoSessionsPage;
