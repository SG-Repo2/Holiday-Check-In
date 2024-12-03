import React, { useContext, useEffect, useState } from 'react';
import { AttendeeContext } from '../AttendeeContext';

const SchedulingGrid = ({ onTimeSlotSelect, selectedSlot }) => {
  const { attendees } = useContext(AttendeeContext);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isExpanded) return;

    // Generate time slots for the 4-hour event window
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
      
      slots.push({
        time: timeString,
        available: true,
        reservedBy: [],
        reservationCount: 0,
        maxReservations: 5
      });
      
      currentTime.setMinutes(currentTime.getMinutes() + 15); // 15-minute intervals
    }

    // Update slot availability based on reservations
    attendees.forEach((attendee) => {
      if (attendee.photographyTimeSlot) {
        const slot = slots.find(s => s.time === attendee.photographyTimeSlot);
        if (slot) {
          slot.reservationCount++;
          slot.reservedBy.push(attendee.id);
          slot.available = slot.reservationCount < slot.maxReservations;
        }
      }
    });

    setTimeSlots(slots);
  }, [attendees, isExpanded]);

  const handleSlotClick = (slot) => {
    if (!slot.available) return;
    onTimeSlotSelect(slot.time);
  };

  return (
    <div>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2 mb-2 text-left bg-gray-100 hover:bg-gray-200 rounded flex justify-between items-center"
      >
        <span>Select Time Slot</span>
        <svg 
          className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="grid grid-cols-4 gap-2">
          {timeSlots.map((slot, index) => (
            <button
              key={index}
              onClick={() => handleSlotClick(slot)}
              disabled={!slot.available}
              className={`p-2 rounded ${
                selectedSlot === slot.time
                  ? 'bg-green-500 text-white'
                  : slot.available
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-red-300 cursor-not-allowed'
              }`}
            >
              {slot.time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchedulingGrid;
