
const reviewModel = require('../models/reviewModel');

// GET all reviews
async function getAllReviews(req, res) {
    try {
        const reviews = await reviewModel.getAllReviews();

        res.status(200).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error('Get reviews error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve reviews.'
        });
    }
}

// POST a review
async function createReview(req, res) {
    try {
        const {
            guest_id,
            reservation_id,
            rating,
            review_comment
        } = req.body;

        const guestId = Number(guest_id);
        const reservationId = Number(reservation_id);
        const starRating = Number(rating);
        const comment = String(review_comment || '').trim();

        // Validate IDs
        if (
            !Number.isInteger(guestId) ||
            guestId <= 0 ||
            !Number.isInteger(reservationId) ||
            reservationId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Valid guest ID and reservation ID are required.'
            });
        }

        // Validate rating
        if (
            !Number.isInteger(starRating) ||
            starRating < 1 ||
            starRating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5 stars.'
            });
        }

        // Validate comment
        if (!comment || comment.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Comment is required and must not exceed 500 characters.'
            });
        }

        // Verify reservation belongs to guest
        const validReservation = await reviewModel.verifyReservation(
            guestId,
            reservationId
        );

        if (!validReservation) {
            return res.status(403).json({
                success: false,
                message: 'Reservation does not belong to this guest.'
            });
        }

        const reviewId = await reviewModel.createReview({
            guest_id: guestId,
            reservation_id: reservationId,
            rating: starRating,
            review_comment: comment
        });

        res.status(201).json({
            success: true,
            message: 'Thank you for your anonymous review!',
            review_id: reviewId
        });

    } catch (error) {
        console.error('Create review error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to submit review.'
        });
    }
}

// PUT update review
async function updateReview(req, res) {
    try {
        const id = Number(req.params.id);
        const rating = Number(req.body.rating);
        const comment = String(req.body.review_comment || '').trim();

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid review ID.'
            });
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5.'
            });
        }

        if (!comment || comment.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Comment is required and must not exceed 500 characters.'
            });
        }

        const updated = await reviewModel.updateReview(id, {
            rating,
            review_comment: comment
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Review not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Review updated successfully.'
        });

    } catch (error) {
        console.error('Update review error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to update review.'
        });
    }
}

// DELETE review
async function deleteReview(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid review ID.'
            });
        }

        const deleted = await reviewModel.deleteReview(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Review not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully.'
        });

    } catch (error) {
        console.error('Delete review error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to delete review.'
        });
    }
}

module.exports = {
    getAllReviews,
    createReview,
    updateReview,
    deleteReview
};