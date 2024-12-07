const API_URL = 'http://localhost:3001/api';

export const getAllAttendees = async () => {
    const response = await fetch(`${API_URL}/attendees`, {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const getAttendee = async (id) => {
    const response = await fetch(`${API_URL}/attendees/${id}`, {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const createAttendee = async (attendee) => {
    const response = await fetch(`${API_URL}/attendees`, {
        method: 'POST',
        credentials: 'include',
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
    const response = await fetch(`${API_URL}/attendees/${id}`, {
        method: 'PUT',
        credentials: 'include',
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
    const response = await fetch(`${API_URL}/attendees/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};
