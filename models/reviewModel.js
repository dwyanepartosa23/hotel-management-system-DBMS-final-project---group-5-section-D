
const db = require('./db');

// Get all reviews without exposing guest identities
async function getAllReviews() {
    const [rows] = await db.query(`
        SELECT
            review_id,
            rating,
            review_comment,
            review_date
        FROM reviews
        ORDER BY review_date DESC
    `);

    return rows;
}

// Check whether reservation belongs to guest
async function verifyReservation(guestId, reservationId) {
    const [rows] = await db.query(
        `SELECT reservation_id
         FROM reservations
         WHERE reservation_id = ?
         AND guest_id = ?`,
        [reservationId, guestId]
    );

    return rows.length > 0;
}

// Create a review
async function createReview(review) {
    const {
        guest_id,
        reservation_id,
        rating,
        review_comment
    } = review;

    const [result] = await db.query(
        `INSERT INTO reviews
        (guest_id, reservation_id, rating, review_comment, review_date)
        VALUES (?, ?, ?, ?, NOW())`,
        [guest_id, reservation_id, rating, review_comment]
    );

    return result.insertId;
}

// Get review by ID
async function getReviewById(id) {
    const [rows] = await db.query(
        `SELECT review_id, guest_id, reservation_id,
                rating, review_comment, review_date
         FROM reviews
         WHERE review_id = ?`,
        [id]
    );

    return rows[0];
}

// Update review
async function updateReview(id, review) {
    const { rating, review_comment } = review;

    const [result] = await db.query(
        `UPDATE reviews
         SET rating = ?, review_comment = ?
         WHERE review_id = ?`,
        [rating, review_comment, id]
    );

    return result.affectedRows;
}

// Delete review
async function deleteReview(id) {
    const [result] = await db.query(
        `DELETE FROM reviews
         WHERE review_id = ?`,
        [id]
    );

    return result.affectedRows;
}

module.exports = {
    getAllReviews,
    verifyReservation,
    createReview,
    getReviewById,
    updateReview,
    deleteReview
};