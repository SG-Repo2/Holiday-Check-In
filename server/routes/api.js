const express = require('express');
const router = express.Router();
const attendeeController = require('../controllers/attendeeController');
const contentController = require('../controllers/contentController');

// Attendee routes
router.get('/attendees', attendeeController.getAllAttendees);
router.get('/attendees/:id', attendeeController.getAttendee);
router.post('/attendees', attendeeController.createAttendee);
router.put('/attendees/:id', attendeeController.updateAttendee);
router.delete('/attendees/:id', attendeeController.deleteAttendee);

// Photo session routes
router.post('/attendees/:id/photo-session', attendeeController.updatePhotoSession);

// Bulk operations
router.put('/attendees/bulk/update', attendeeController.bulkUpdateAttendees);

// Content routes
router.get('/content', contentController.getAllContent);
router.get('/content/:table', contentController.getTableContent);

module.exports = router;
