const db = require('./db');

async function getAllReviews() {
    const [rows] = await db.query(
        'SELECT * FROM reviews ORDER BY review_id'
    );
    return rows;
}

async function createReview(guest_id, reservation_id, rating, review_comment, review_date) {
    const [result] = await db.query(
        'INSERT INTO reviews (guest_id, reservation_id, rating, review_comment, review_date) VALUES (?, ?, ?, ?, ?)',
        [guest_id, reservation_id, rating, review_comment, review_date]
    );
    return result.insertId;
}

async function updateReview(review_id, guest_id, reservation_id, rating, review_comment, review_date) {
    const [result] = await db.query(
        'UPDATE reviews SET guest_id = ?, reservation_id = ?, rating = ?, review_comment = ?, review_date = ? WHERE review_id = ?',
        [guest_id, reservation_id, rating, review_comment, review_date, review_id]
    );
    return result.affectedRows;
}

async function deleteReview(review_id) {
    const [result] = await db.query(
        'DELETE FROM reviews WHERE review_id = ?',
        [review_id]
    );
    return result.affectedRows;
}

module.exports = {
    getAllReviews,
    createReview,
    updateReview,
    deleteReview
};