import { useState, useContext, useMemo } from 'react';
import { AttendeeContext } from '../AttendeeContext';

export const useAttendeeFilter = () => {
  const { attendees } = useContext(AttendeeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckedIn, setShowCheckedIn] = useState(undefined);
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredAttendees = useMemo(() => {
    return attendees.filter((attendee) => {
      // Apply name search filter
      const searchMatch = `${attendee.firstName} ${attendee.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (!searchMatch) return false;

      // Apply check-in status filter
      if (showCheckedIn !== undefined) {
        if (showCheckedIn && !attendee.checkedIn) return false;
        if (!showCheckedIn && attendee.checkedIn) return false;
      }

      return true;
    });
  }, [attendees, searchQuery, showCheckedIn]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setShowCheckedIn(
      value === 'all' ? undefined : value === 'true'
    );
  };

  const toggleAddForm = (show) => {
    setShowAddForm(show);
  };

  return {
    searchQuery,
    showCheckedIn,
    showAddForm,
    filteredAttendees,
    handleSearchChange,
    handleStatusChange,
    toggleAddForm
  };
};
