import React, { useState, useEffect, useRef, useContext } from 'react';
import { AttendeeContext } from '../AttendeeContext';
import PhotoSessionDetails from './PhotoSessionDetails';
import PhotoSessionVerification from './PhotoSessionVerification';

const PhotoSessionCalendarView = ({ filteredSessions }) => {
  const { attendees } = useContext(AttendeeContext);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const dropdownRef = useRef(null);

  // Reference existing SchedulingGrid.js for time slot generation logic
  useEffect(() => {
    const slots = [];
    const eventStart = new Date();
    eventStart.setHours(18, 0, 0, 0); // 6:00 PM
    const eventEnd = new Date(eventStart);
    eventEnd.setHours(22, 0, 0, 0); // 10:00 PM

    let currentTime = new Date(eventStart);

    while (currentTime < eventEnd) {
      const timeString = currentTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const sessionsAtTime = filteredSessions.filter(
        session => session.timeSlot === timeString
      );

      slots.push({
        time: timeString,
        sessions: sessionsAtTime,
        count: sessionsAtTime.length,
        maxCapacity: 5
      });
      
      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }

    setTimeSlots(slots);
  }, [filteredSessions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSelectedTimeSlot(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSessionDetails = (session) => {
    const attendee = attendees.find(a => a.id === session.attendeeId);
    if (!attendee) return null;

    const totalParticipants = 1 + 
      (attendee.children?.length || 0) + 
      (attendee.guestNames?.length || 0);

    return (
      <div 
        key={session.attendeeId} 
        className="border-b pb-2 cursor-pointer hover:bg-gray-50"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedSession(session);
        }}
      >
        <div className="font-medium">
          {attendee.firstName} {attendee.lastName}
        </div>
        <div className="text-sm text-gray-600">
          Service Center: {attendee.serviceCenter}
        </div>
        <div className="text-sm text-gray-600">
          Participants: {totalParticipants}
          {attendee.children?.length > 0 && 
            ` (${attendee.children.length} children)`}
          {attendee.guestNames?.length > 0 &&
            ` (${attendee.guestNames.length} guests)`}
        </div>
        {attendee.additionalInfo?.wantsPortrait && (
          <div className="text-sm text-blue-600">
            Portrait Session
          </div>
        )}
        {session.status === 'completed' && (
          <span className="text-sm text-green-600">✓ Completed</span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-4 gap-4">
        {timeSlots.map((slot, index) => (
          <div key={index} className="relative">
            <button
              onClick={() => setSelectedTimeSlot(slot.time === selectedTimeSlot ? null : slot.time)}
              className={`w-full p-4 rounded-lg shadow ${
                slot.count >= slot.maxCapacity 
                  ? 'bg-red-100'
                  : slot.count > 0
                  ? 'bg-yellow-100'
                  : 'bg-green-100'
              }`}
            >
              <div className="font-semibold">{slot.time}</div>
              <div className="text-sm">
                {slot.count} / {slot.maxCapacity} Booked
              </div>
            </button>

            {selectedTimeSlot === slot.time && slot.sessions.length > 0 && (
              <div 
                ref={dropdownRef}
                className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 p-4"
              >
                <h4 className="font-semibold mb-3">Sessions at {slot.time}</h4>
                <div className="space-y-3">
                  {slot.sessions.map(session => getSessionDetails(session))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <PhotoSessionDetails />
      </div>

      {selectedSession && (
        <PhotoSessionVerification
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
};

export default PhotoSessionCalendarView; 