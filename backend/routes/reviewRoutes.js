const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createReview,
  getReviewsByProduct,
  deleteReview,
  getReviewSummary
} = require('../controllers/reviewController');

router.post('/', auth, createReview);
router.get('/product/:productId', getReviewsByProduct);
router.delete('/:id', deleteReview);
router.get('/summary/:productId', getReviewSummary);


module.exports = router;