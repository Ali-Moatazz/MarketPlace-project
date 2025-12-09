const express = require('express');
const router = express.Router();
const aiAgentController = require('../controllers/aiAgentController');

// Public route to handle voice commands
router.post('/process-command', aiAgentController.processVoiceCommand);

module.exports = router;