    const db = require('./db');

    // Reservations that can still be active or upcoming for a room.
    const LIVE_STATUSES = "'Pending', 'Confirmed', 'Checked-in'";

    // A room is Occupied only while a guest is actually staying.
    const OCCUPYING_STATUSES = "'Confirmed', 'Checked-in'";

    // An order can only be completed or declined while it is still open.
    const OPEN_ORDER_STATUSES = "'Pending', 'In Progress'";

    // One row per room: the current stay if there is one, otherwise the next
    // upcoming reservation. Past and cancelled stays are ignored.
    async function getAllRoomsWithStatus() {
        const [rows] = await db.query(`
            SELECT
                r.room_id,
                r.room_number,
                r.floor_number,
                r.room_status,
                rt.type_name,
                cur.reservation_id,
                DATE_FORMAT(cur.check_in_date, '%Y-%m-%d') AS check_in_date,
                DATE_FORMAT(cur.check_out_date, '%Y-%m-%d') AS check_out_date,
                cur.reservation_status,
                cur.first_name,
                cur.guest_id,
                CASE
                    WHEN cur.reservation_id IS NOT NULL
                        AND cur.check_in_date <= CURDATE()
                        AND cur.reservation_status IN (${OCCUPYING_STATUSES})
                    THEN 'Occupied'
                    ELSE 'Available'
                END AS occupancy
            FROM rooms r
            LEFT JOIN room_types rt
                ON r.room_type_id = rt.room_type_id
            LEFT JOIN (
                SELECT
                    rr.room_id,
                    res.reservation_id,
                    res.check_in_date,
                    res.check_out_date,
                    res.reservation_status,
                    g.first_name,
                    g.guest_id,
                    ROW_NUMBER() OVER (
                        PARTITION BY rr.room_id
                        ORDER BY (res.check_in_date <= CURDATE()) DESC,
                                res.check_in_date ASC
                    ) AS rn
                FROM reservation_rooms rr
                INNER JOIN reservations res
                    ON rr.reservation_id = res.reservation_id
                LEFT JOIN guests g
                    ON res.guest_id = g.guest_id
                WHERE res.reservation_status IN (${LIVE_STATUSES})
                AND res.check_out_date > CURDATE()
            ) cur
                ON cur.room_id = r.room_id AND cur.rn = 1
            ORDER BY r.room_number
        `);

        return rows;
    }

    // Service orders of the room's current (or next) reservation only.
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
            INNER JOIN services s
                ON so.service_id = s.service_id
            WHERE so.reservation_id = (
                SELECT x.reservation_id
                FROM (
                    SELECT
                        res.reservation_id,
                        ROW_NUMBER() OVER (
                            ORDER BY (res.check_in_date <= CURDATE()) DESC,
                                    res.check_in_date ASC
                        ) AS rn
                    FROM reservation_rooms rr
                    INNER JOIN reservations res
                        ON rr.reservation_id = res.reservation_id
                    WHERE rr.room_id = ?
                    AND res.reservation_status IN (${LIVE_STATUSES})
                    AND res.check_out_date > CURDATE()
                ) x
                WHERE x.rn = 1
            )
            ORDER BY so.order_date DESC, so.service_order_id DESC
        `, [roomId]);

        return rows;
    }

    async function markOrderAsServed(orderId) {
        const [result] = await db.query(`
            UPDATE service_orders
            SET order_status = 'Completed'
            WHERE service_order_id = ?
            AND order_status IN (${OPEN_ORDER_STATUSES})
        `, [orderId]);

        return result.affectedRows;
    }

    async function declineOrderWithReason(orderId, reason) {
        const [result] = await db.query(`
            UPDATE service_orders
            SET order_status = 'Declined', decline_comment = ?
            WHERE service_order_id = ?
            AND order_status IN (${OPEN_ORDER_STATUSES})
        `, [reason, orderId]);

        return result.affectedRows;
    }

    module.exports = {
        getAllRoomsWithStatus,
        getOrdersByRoomId,
        markOrderAsServed,
        declineOrderWithReason
    };