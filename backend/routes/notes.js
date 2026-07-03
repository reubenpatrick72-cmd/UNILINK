const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { authenticate } = require('../middleware/auth');

// Get all notes with filters
router.get('/all', noteController.getAllNotes);

// Get note by ID
router.get('/:id', noteController.getNoteById);

// Get courses
router.get('/courses/list', noteController.getCourses);

// Get units by course
router.get('/courses/:course/units', noteController.getUnitsByCourse);

// Get seller info
router.get('/seller/:sellerId/info', noteController.getSellerInfo);

// Upload new note (requires authentication)
router.post('/upload', authenticate, noteController.uploadNote);

module.exports = router;
