const express = require('express');
const router = express.Router();
const controller = require('../controllers/flagController');
const { auth } = require('../middleware/auth'); // Import Auth Middleware

// FIX: Protect the route with 'auth'
router.post('/', auth, controller.createFlag);

router.get('/reported/:userId', auth, controller.getFlagsForUser);
router.put('/:id/status', auth, controller.updateFlagStatus);

module.exports = router;