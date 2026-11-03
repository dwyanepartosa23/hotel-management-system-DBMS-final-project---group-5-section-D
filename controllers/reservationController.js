// Contributor: Ricaplaza
const reservationModel = require('../models/reservationModel');

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

        const reservationId = await reservationModel.createReservation(
            guest_id ?? null,
            employee_id ?? null,
            reservation_date,
            check_in_date,
            check_out_date,
            reservation_status,
            special_requests ?? null
        );

        res.status(201).json({
            message: 'Reservation created successfully.',
            reservation_id: reservationId
        });
    } catch (error) {
        console.error(error.message);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                message: 'The specified guest or employee does not exist.'
            });
        }

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
