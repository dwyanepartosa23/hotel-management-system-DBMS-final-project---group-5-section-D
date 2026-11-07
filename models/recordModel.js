const db = require('./db');

async function getAllRoomsWithStatus() {
    const [rows] = await db.query(`
        SELECT
            r.room_id,
            r.room_number,
            r.floor_number,
            r.room_status,
            rt.type_name,
            res.reservation_id,
            res.check_in_date,
            res.check_out_date,
            g.first_name,
            g.guest_id
        FROM rooms r
        LEFT JOIN room_types rt 
            ON r.room_type_id = rt.room_type_id
        LEFT JOIN reservation_rooms rr 
            ON r.room_id = rr.room_id
        LEFT JOIN reservations res 
            ON rr.reservation_id = res.reservation_id
            AND res.reservation_status = 'Confirmed'
        LEFT JOIN guests g 
            ON res.guest_id = g.guest_id
        ORDER BY r.room_number
    `);
    return rows;




}


async function getOrdersByRoomId(roomId) {
    const [rows] = await db.query(`
        SELECT
            so.service_order_id,
            so.reservation_id,
            so.service_id,
            s.service_name,
            s.service_price,
            so.quantity,
            so.subtotal,
            so.order_status,
            so.decline_comment,
            DATE_FORMAT(so.order_date, '%Y-%m-%d') AS order_date
        FROM service_orders so
        INNER JOIN services s ON so.service_id = s.service_id
        INNER JOIN reservations res ON so.reservation_id = res.reservation_id
        WHERE res.room_id = ?
        ORDER BY so.order_date DESC
    `, [roomId]);
    return rows;
}

async function markOrderAsServed(orderId) {
    const [result] = await db.query(`
        UPDATE service_orders
        SET order_status = 'Served'
        WHERE service_order_id = ?
    `, [orderId]);
    return result.affectedRows;
}

async function declineOrderWithReason(orderId, reason) {
    const [result] = await db.query(`
        UPDATE service_orders
        SET order_status = 'Declined', decline_comment = ?
        WHERE service_order_id = ?
    `, [reason || null, orderId]);
    return result.affectedRows;
}

module.exports = {
    getAllRoomsWithStatus,
    getOrdersByRoomId,
    markOrderAsServed,
    declineOrderWithReason
};
