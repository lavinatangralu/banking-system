const express = require('express');
const router = express.Router();
const { getAccountDetails, lookupAccount } = require('../controllers/accountController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Protected account routes
router.get('/details', verifyToken, getAccountDetails);
router.get('/lookup/:accountNumber', verifyToken, lookupAccount);

module.exports = router;

