
const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewController');

// Get all reviews
router.get('/', reviewController.getAllReviews);

// Submit a review
router.post('/', reviewController.createReview);

// Update a review
router.put('/:id', reviewController.updateReview);

// Delete a review
router.delete('/:id', reviewController.deleteReview);

module.exports = router;