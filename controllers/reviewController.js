const reviewModel = require('../models/reviewModel');

async function getReviews(req, res) {
    try {
        const reviews = await reviewModel.getAllReviews();
        res.status(200).json(reviews);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to retrieve reviews.' });
    }
}

async function createReview(req, res) {
    try {
        const { guest_id, reservation_id, rating, review_comment, review_date } = req.body;

        if (!guest_id || !reservation_id || !rating || !review_comment || !review_date) {
            return res.status(400).json({
                message: 'Guest ID, reservation ID, rating, review comment, and review date are required.'
            });
        }

        const reviewId = await reviewModel.createReview(
            guest_id,
            reservation_id,
            rating,
            review_comment,
            review_date
        );

        res.status(201).json({
            message: 'Review created successfully.',
            review_id: reviewId
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to create review.' });
    }
}

async function updateReview(req, res) {
    try {
        const { guest_id, reservation_id, rating, review_comment, review_date } = req.body;
        const reviewId = Number(req.params.id);

        if (!Number.isInteger(reviewId) || reviewId < 1) {
            return res.status(400).json({ message: 'Invalid review ID.' });
        }

        if (!guest_id || !reservation_id || !rating || !review_comment || !review_date) {
            return res.status(400).json({
                message: 'Guest ID, reservation ID, rating, review comment, and review date are required.'
            });
        }

        const affectedRows = await reviewModel.updateReview(
            reviewId,
            guest_id,
            reservation_id,
            rating,
            review_comment,
            review_date
        );

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        res.status(200).json({ message: 'Review updated successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to update review.' });
    }
}

async function deleteReview(req, res) {
    try {
        const reviewId = Number(req.params.id);

        if (!Number.isInteger(reviewId) || reviewId < 1) {
            return res.status(400).json({ message: 'Invalid review ID.' });
        }

        const affectedRows = await reviewModel.deleteReview(reviewId);

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        res.status(200).json({ message: 'Review deleted successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to delete review.' });
    }
}

module.exports = {
    getReviews,
    createReview,
    updateReview,
    deleteReview
};