const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { validateRegistration } = require('../middleware/validation'); // Import

// Public routes
// FIX: Apply validation middleware here
router.post('/register', validateRegistration, userController.register);

router.post('/login', userController.login);
router.post('/logout', userController.logout);

router.get('/sellers', userController.getSellers);
router.get('/sellers/:id', userController.getSellerById);

// Profile routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

module.exports = router;