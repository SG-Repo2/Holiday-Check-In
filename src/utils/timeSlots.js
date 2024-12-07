export const TIME_SLOTS = [
  { value: '11:45', display: '11:45 AM' },
  { value: '12:00', display: '12:00 PM' },
  { value: '12:15', display: '12:15 PM' },
  { value: '12:30', display: '12:30 PM' },
  { value: '14:45', display: '2:45 PM' },
  { value: '15:00', display: '3:00 PM' }
];

export const formatTimeSlot = (time) => {
  const slot = TIME_SLOTS.find(slot => slot.value === time);
  return slot ? slot.display : time;
}; 