const express = require('express');
const router = express.Router();
const {
  deposit,
  withdraw,
  transfer,
  getHistory,
} = require('../controllers/transactionController');
const { verifyToken } = require('../middlewares/authMiddleware');

// All transaction operations require authentication
router.use(verifyToken);

router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.post('/transfer', transfer);
router.get('/history', getHistory);

module.exports = router;

