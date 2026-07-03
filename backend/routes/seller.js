const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { authenticate } = require('../middleware/auth');

router.get('/dashboard', authenticate, noteController.getSellerDashboard);
router.get('/notes', authenticate, noteController.getSellerNotes);
router.post('/notes', authenticate, noteController.uploadNote);
router.put('/notes/:id', authenticate, noteController.updateNote);
router.delete('/notes/:id', authenticate, noteController.deleteNote);

module.exports = router;
