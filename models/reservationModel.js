const db = require('./db');
const roomModel = require('./roomModel');

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
        [guest_id, employee_id, reservation_date,
         check_in_date, check_out_date, reservation_status, special_requests]
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
        [guest_id, employee_id, reservation_date,
         check_in_date, check_out_date, reservation_status,
         special_requests, reservation_id]
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

async function createBooking(booking) {
    const {
        guest_name,
        email,
        phone,
        room_type,
        check_in,
        check_out,
        guests,
        special_requests
    } = booking;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [typeRows] = await connection.query(
            `SELECT room_type_id, type_name, capacity, price_per_night
             FROM room_types
             WHERE type_name = ?
             FOR UPDATE`,
            [room_type]
        );
        if (!typeRows.length) {
            await connection.rollback();
            return { status: 'invalid_room_type' };
        }
        const roomType = typeRows[0];

        if (guests > roomType.capacity) {
            await connection.rollback();
            return { status: 'over_capacity', capacity: roomType.capacity };
        }

        const room = await roomModel.findAvailableRoom(
            roomType.room_type_id,
            check_in,
            check_out,
            guests,
            connection
        );
        if (!room) {
            await connection.rollback();
            console.log('No available room for type:', room_type);
            return { status: 'no_room' };
        }
        console.log('Found available room: #' + room.room_number);

        const [guestRows] = await connection.query(
            'SELECT guest_id FROM guests WHERE email = ? LIMIT 1',
            [email]
        );
        let guestId;
        if (guestRows.length > 0) {
            guestId = guestRows[0].guest_id;
        } else {
            const [guestResult] = await connection.query(
                'INSERT INTO guests (first_name, phone, email) VALUES (?, ?, ?)',
                [guest_name, phone, email]
            );
            guestId = guestResult.insertId;
        }

        const [resResult] = await connection.query(
            `INSERT INTO reservations
             (guest_id, employee_id, reservation_date, check_in_date,
              check_out_date, reservation_status, special_requests)
             VALUES (?, NULL, NOW(), ?, ?, 'Pending', ?)`,
            [guestId, check_in, check_out, special_requests || null]
        );
        const reservationId = resResult.insertId;

        await connection.query(
            `INSERT INTO reservation_rooms
             (reservation_id, room_id, nightly_rate)
             VALUES (?, ?, ?)`,
            [reservationId, room.room_id, room.price_per_night]
        );

        const [updateResult] = await connection.query(
            `UPDATE rooms
             SET room_status = 'Booked'
             WHERE room_id = ?`,
            [room.room_id]
        );
        console.log('Room ' + room.room_id + ' status updated: ' + updateResult.affectedRows + ' row(s) changed');

        await connection.commit();
        console.log('Booking successful — Reservation ID: ' + reservationId);

        return {
            status: 'ok',
            reservation_id,
            guest_id: guestId,
            guest_name,
            room_number: room.room_number,
            room_type: room.type_name
        };
    } catch (error) {
        console.error('Booking FAILED:', error.message);
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

const { getServicesForReservation, getServiceTotal } = require('./serviceModel');
const { getPaymentsForInvoice } = require('./invoiceModel');

async function findGuest(email = null, guest_id = null) {
    let query, params;
    if (email) {
        query = 'SELECT * FROM guests WHERE email = ? LIMIT 1';
        params = [email.toLowerCase().trim()];
    } else if (guest_id) {
        query = 'SELECT * FROM guests WHERE guest_id = ? LIMIT 1';
        params = [guest_id];
    } else {
        throw new Error('Provide Email or Guest ID');
    }
    const [result] = await db.query(query, params);
    return result[0] || null;
}

async function getGuestFullDetails(guest_identifier) {
    let guest = await findGuest(guest_identifier);
    if (!guest && !isNaN(guest_identifier)) {
        guest = await findGuest(null, parseInt(guest_identifier));
    }
    if (!guest) return { found: false, message: 'No guest found with that Email or ID' };

    const [reservations] = await db.query(`
        SELECT * FROM reservations
        WHERE guest_id = ?
        ORDER BY check_in_date DESC
    `, [guest.guest_id]);

    const reservationDetails = [];
    for (const res of reservations) {
        const [rooms] = await db.query(`
            SELECT
                r.room_number,
                rt.type_name,
                rt.price_per_night
            FROM reservation_rooms rr
            INNER JOIN rooms r ON rr.room_id = r.room_id
            INNER JOIN room_types rt ON r.room_type_id = rt.room_type_id
            WHERE rr.reservation_id = ?
        `, [res.reservation_id]);

        const services = await getServicesForReservation(res.reservation_id);
        const service_total = await getServiceTotal(res.reservation_id);

        const [invoices] = await db.query(`
            SELECT * FROM invoices WHERE reservations_id = ? LIMIT 1
        `, [res.reservation_id]);
        const invoice = invoices[0] || null;

        let payments = [], balance_due = 0, total_paid = 0;
        if (invoice) {
            payments = await getPaymentsForInvoice(invoice.invoices_id);
            total_paid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
            balance_due = Number(invoice.total_amount) - total_paid;
        }

        const nights = Math.ceil(
            (new Date(res.check_out_date) - new Date(res.check_in_date)) / (1000 * 60 * 60 * 24)
        );
        const room_total = rooms.reduce((sum, r) => sum + (Number(r.price_per_night) * nights), 0);

        reservationDetails.push({
            reservation_id: res.reservation_id,
            check_in_date: res.check_in_date,
            check_out_date: res.check_out_date,
            nights,
            status: res.reservation_status,
            rooms,
            services,
            service_total: Number(service_total),
            invoice: invoice ? {
                invoices_id: invoice.invoices_id,
                total_amount: Number(invoice.total_amount),
                balance_due,
                payment_status: balance_due <= 0 ? 'Fully Paid' :
                    (invoice.invoice_status === 'Overdue' ? 'Overdue' : invoice.invoice_status || 'Unpaid')
            } : null,
            payments,
            room_total,
            grand_total: room_total + Number(service_total)
        });
    }

    return {
        found: true,
        guest: {
            guest_id: guest.guest_id,
            first_name: guest.first_name,
            last_name: guest.last_name || '',
            email: guest.email,
            phone: guest.phone
        },
        reservations: reservationDetails
    };
}

module.exports = {
    getAllReservations,
    createReservation,
    updateReservation,
    deleteReservation,
    createBooking,
    findGuest,
    getGuestFullDetails
};
