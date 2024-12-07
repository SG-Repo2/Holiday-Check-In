-- Drop existing tables if they exist
DROP TABLE IF EXISTS photo_sessions;
DROP TABLE IF EXISTS children;
DROP TABLE IF EXISTS attendees;

-- Create Attendees table
CREATE TABLE attendees (
    id VARCHAR(36) PRIMARY KEY,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    email VARCHAR(255),
    photographyTimeSlot VARCHAR(50),
    photographyStatus VARCHAR(20),
    photographyEmail VARCHAR(255),
    notes TEXT,
    checkedIn BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Children table
CREATE TABLE children (
    id VARCHAR(36) PRIMARY KEY,
    attendeeId VARCHAR(36),
    name VARCHAR(100),
    age INT,
    gender VARCHAR(20),
    verified BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (attendeeId) REFERENCES attendees(id) ON DELETE CASCADE
);

-- Create Photo Sessions table
CREATE TABLE photo_sessions (
    id VARCHAR(36) PRIMARY KEY,
    attendeeId VARCHAR(36),
    timeSlot VARCHAR(50),
    email VARCHAR(255),
    status VARCHAR(20),
    notes TEXT,
    totalParticipants INT DEFAULT 1,
    completedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (attendeeId) REFERENCES attendees(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_attendee_email ON attendees(email);
CREATE INDEX idx_attendee_name ON attendees(firstName, lastName);
CREATE INDEX idx_children_attendee ON children(attendeeId);
CREATE INDEX idx_photo_sessions_attendee ON photo_sessions(attendeeId);