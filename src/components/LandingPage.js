import React, { useState, useContext } from 'react';
import { AttendeeContext } from '../AttendeeContext';

const LandingPage = () => {
  const { attendees } = useContext(AttendeeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = attendees.filter((attendee) =>
      `${attendee.firstName} ${attendee.lastName}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed top-0 w-full bg-hydro-blue shadow-md z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-center">
            <h1 className="text-white text-xl font-semibold">
              Holiday Party Check-In
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-24 max-w-lg">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <input
            type="text"
            className="w-full p-3 border rounded-lg mb-4"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
          />

          <div className="space-y-2">
            {searchResults.map((attendee) => (
              <div
                key={attendee.id}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium">
                  {attendee.firstName} {attendee.lastName}
                </div>
                {attendee.serviceCenter && (
                  <div className="text-sm text-gray-600">
                    Service Center: {attendee.serviceCenter}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  Status: {attendee.checkedIn ? 'Checked In' : 'Not Checked In'}
                </div>
                {attendee.guestNames?.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Guests: {attendee.guestNames.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 