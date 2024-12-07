const API_BASE_URL = 'https://chiwebdev.com/hydro/server/api';

export const getAllAttendees = async () => {
    const response = await fetch(`${API_BASE_URL}/attendees`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        },
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const getAttendee = async (id) => {
    const response = await fetch(`${API_BASE_URL}/attendees/${id}`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        },
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const createAttendee = async (attendee) => {
    const response = await fetch(`${API_BASE_URL}/attendees`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(attendee)
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const updateAttendee = async (id, attendee) => {
    const response = await fetch(`${API_BASE_URL}/attendees/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(attendee)
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const deleteAttendee = async (id) => {
    const response = await fetch(`${API_BASE_URL}/attendees/${id}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};
