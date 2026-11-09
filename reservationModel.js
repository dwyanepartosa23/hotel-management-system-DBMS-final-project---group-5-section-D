// COntributo: Ricaplaza
// Modifier:Palmis (for invoices)

const db = require('./db');

async function getAllReservations() {
    const [rows] = await db.query(`
        SELECT
            r.reservation_id,
            r.guest_id,
            g.first_name AS guest_name,
            r.employee_id,
            r.reservation_date,
            r.check_in_date,
            r.check_out_date,
            r.reservation_status,
            r.special_requests
        FROM reservations r
        LEFT JOIN guests g ON r.guest_id = g.guest_id
        ORDER BY r.reservation_id
    `);

    return rows;
}

async function createReservation(
    guest_id,
    employee_id,
    reservation_date,
    check_in_date,
    check_out_date,
    reservation_status,
    special_requests
) {
    const [result] = await db.query(
        `INSERT INTO reservations
        (guest_id, employee_id, reservation_date, check_in_date,
         check_out_date, reservation_status, special_requests)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            guest_id,
            employee_id,
            reservation_date,
            check_in_date,
            check_out_date,
            reservation_status,
            special_requests
        ]
    );

    return result.insertId;
}

async function updateReservation(
    reservation_id,
    guest_id,
    employee_id,
    reservation_date,
    check_in_date,
    check_out_date,
    reservation_status,
    special_requests
) {
    const [result] = await db.query(
        `UPDATE reservations
        SET guest_id = ?, employee_id = ?, reservation_date = ?,
            check_in_date = ?, check_out_date = ?,
            reservation_status = ?, special_requests = ?
        WHERE reservation_id = ?`,
        [
            guest_id,
            employee_id,
            reservation_date,
            check_in_date,
            check_out_date,
            reservation_status,
            special_requests,
            reservation_id
        ]
    );

    return result.affectedRows;
}

async function deleteReservation(reservation_id) {
    const [result] = await db.query(
        'DELETE FROM reservations WHERE reservation_id = ?',
        [reservation_id]
    );

    return result.affectedRows;
}

module.exports = {
    getAllReservations,
    createReservation,
    updateReservation,
    deleteReservation
};