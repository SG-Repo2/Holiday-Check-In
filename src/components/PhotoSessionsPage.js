import React, { useState, useContext } from 'react';
import { PhotoContext } from '../PhotoContext';
import { AttendeeContext } from '../AttendeeContext';
import DetailView from './DetailView';
import PhotoSessionList from './PhotoSessionList';
import PhotoSessionCalendarView from './PhotoSessionCalendarView';
import { usePhotoSessionsFilter } from '../hooks/usePhotoSessionsFilter';

const PhotoSessionsPage = () => {
  const [viewMode, setViewMode] = useState('list');
  const { selectedAttendee } = useContext(AttendeeContext);
  const { photoSessions } = useContext(PhotoContext);
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    timeFilter,
    setTimeFilter,
    filteredSessions
  } = usePhotoSessionsFilter();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 pt-32">
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

        {/* Filtering UI */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            className="flex-1 p-2 border rounded"
            placeholder="Search by name or service center..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="p-2 border rounded bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
          <select
            className="p-2 border rounded bg-white"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">All Times</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
        
        <div className="mb-4">
          {viewMode === 'list' ? (
            <PhotoSessionList filteredSessions={filteredSessions} />
          ) : (
            <PhotoSessionCalendarView filteredSessions={filteredSessions} />
          )}
        </div>
        
        {selectedAttendee && <DetailView />}
      </div>
    </div>
  );
};

export default PhotoSessionsPage;
