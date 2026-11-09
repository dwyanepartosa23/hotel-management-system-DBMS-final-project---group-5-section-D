// Contributor: Ricaplaza
const reservationModel = require('../models/reservationModel');
const db = require('../models/db');


async function getReservations(req, res) {
    try {
        const reservations = await reservationModel.getAllReservations();
        res.status(200).json(reservations);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Failed to retrieve reservations.'
        });
    }
}

async function createReservation(req, res) {
    try {
        const {
            guest_name,
            email,
            phone,
            room_type,
            check_in,
            check_out,  
            guests,
            special_requests
        } = req.body;

        if (!check_in || !check_out) {
            return res.status(400).json({
                message: 'Check-in date and check-out date are required.'
            });
        }

        if (check_out <= check_in) {
            return res.status(400).json({
                message: 'Check-out date must be after check-in date.'
            });
        }

        const reservation_date = new Date().toISOString().split('T')[0];
        const reservation_status = 'Confirmed';

        const [guestResult] = await db.query(
            `INSERT INTO guests (first_name, email, phone) VALUES (?, ?, ?)`,
            [guest_name, email, phone]
        );
        const guest_id = guestResult.insertId;

        const [resResult] = await db.query(
            `INSERT INTO reservations 
            (guest_id, reservation_date, check_in_date, check_out_date, reservation_status, special_requests)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [guest_id, reservation_date, check_in, check_out, reservation_status, special_requests]
        );
        const reservation_id = resResult.insertId;

       const [roomResult] = await db.query(
    `SELECT r.room_id
     FROM rooms r
     INNER JOIN room_types rt ON r.room_type_id = rt.room_type_id
     WHERE LOWER(rt.type_name) = LOWER(?)
     AND r.room_id NOT IN (
         SELECT rr.room_id FROM reservation_rooms rr
         INNER JOIN reservations res ON rr.reservation_id = res.reservation_id
         WHERE res.reservation_status IN ('Pending', 'Confirmed', 'Checked-in')
         AND res.check_out_date > ?
     )
     LIMIT 1`,
    [room_type, check_in]
);



        if (!roomResult.length) {
            return res.status(400).json({
                message: 'No available room for this type and date range.'
            });
        }

        const room_id = roomResult[0].room_id;

        await db.query(
            `INSERT INTO reservation_rooms (reservation_id, room_id) VALUES (?, ?)`,
            [reservation_id, room_id]
        );

        res.status(201).json({
            message: 'Reservation created successfully.',
            reservation_id: reservation_id
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Failed to create reservation.'
        });
    }
}


async function updateReservation(req, res) {
    try {
        const reservationId = Number(req.params.id);

        if (!Number.isInteger(reservationId) || reservationId < 1) {
            return res.status(400).json({
                message: 'Invalid reservation ID.'
            });
        }

        const {
            guest_id,
            employee_id,
            reservation_date,
            check_in_date,
            check_out_date,
            reservation_status,
            special_requests
        } = req.body;

        if (
            !reservation_date ||
            !check_in_date ||
            !check_out_date ||
            !reservation_status
        ) {
            return res.status(400).json({
                message: 'Reservation date, check-in date, check-out date, and status are required.'
            });
        }

        if (check_out_date <= check_in_date) {
            return res.status(400).json({
                message: 'Check-out date must be after check-in date.'
            });
        }

        const affectedRows = await reservationModel.updateReservation(
            reservationId,
            guest_id ?? null,
            employee_id ?? null,
            reservation_date,
            check_in_date,
            check_out_date,
            reservation_status,
            special_requests ?? null
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                message: 'Reservation not found or no changes made.'
            });
        }

        res.status(200).json({
            message: 'Reservation updated successfully.'
        });
    } catch (error) {
        console.error(error.message);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                message: 'The specified guest or employee does not exist.'
            });
        }

        res.status(500).json({
            message: 'Failed to update reservation.'
        });
    }
}

async function deleteReservation(req, res) {
    try {
        const reservationId = Number(req.params.id);

        if (!Number.isInteger(reservationId) || reservationId < 1) {
            return res.status(400).json({
                message: 'Invalid reservation ID.'
            });
        }

        const affectedRows =
            await reservationModel.deleteReservation(reservationId);

        if (affectedRows === 0) {
            return res.status(404).json({
                message: 'Reservation not found.'
            });
        }

        res.status(200).json({
            message: 'Reservation deleted successfully.'
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Failed to delete reservation.'
        });
    }
}

module.exports = {
    getReservations,
    createReservation,
    updateReservation,
    deleteReservation
};