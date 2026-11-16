const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (requires valid JWT)
router.get('/me', verifyToken, getMe);

module.exports = router;

