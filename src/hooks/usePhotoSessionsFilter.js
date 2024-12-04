import { useState, useContext, useMemo } from 'react';
import { PhotoContext } from '../PhotoContext';
import { AttendeeContext } from '../AttendeeContext';

export const usePhotoSessionsFilter = () => {
  const { photoSessions } = useContext(PhotoContext);
  const { attendees } = useContext(AttendeeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  const getAttendeeInfo = (attendeeId) => {
    return attendees.find(a => a.id === attendeeId);
  };

  const filteredSessions = useMemo(() => {
    return photoSessions.filter(session => {
      const attendee = getAttendeeInfo(session.attendeeId);
      if (!attendee) return false;

      // Apply search filter
      const searchMatch = `${attendee.firstName} ${attendee.lastName} ${attendee.serviceCenter}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (!searchMatch) return false;

      // Apply status filter
      if (statusFilter !== 'all') {
        const isCompleted = session.status === 'completed';
        if (statusFilter === 'completed' && !isCompleted) return false;
        if (statusFilter === 'pending' && isCompleted) return false;
      }

      // Apply time filter
      if (timeFilter !== 'all') {
        const sessionTime = new Date(`2024-01-01 ${session.timeSlot}`);
        const currentTime = new Date();
        currentTime.setFullYear(2024, 0, 1); // Set to same date for comparison

        if (timeFilter === 'upcoming' && sessionTime <= currentTime) return false;
        if (timeFilter === 'past' && sessionTime > currentTime) return false;
      }

      return true;
    });
  }, [photoSessions, searchQuery, statusFilter, timeFilter, attendees]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    timeFilter,
    setTimeFilter,
    filteredSessions
  };
};
