
const serviceOrderModel = require('../models/serviceOrderModel');

function validateOrder(body) {
    const {
        reservation_id,
        service_id,
        employee_id,
        quantity,
        order_date,
        order_status,
        subtotal
    } = body;

    if (
        !Number.isInteger(Number(reservation_id)) ||
        Number(reservation_id) < 1 ||
        !Number.isInteger(Number(service_id)) ||
        Number(service_id) < 1 ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) < 1 ||
        !order_date ||
        !order_status?.trim() ||
        subtotal === undefined ||
        subtotal === '' ||
        !Number.isFinite(Number(subtotal)) ||
        Number(subtotal) < 0
    ) {
        return 'Reservation, service, positive quantity, order date, status, and valid subtotal are required.';
    }

    if (
        employee_id !== undefined &&
        employee_id !== null &&
        employee_id !== '' &&
        (!Number.isInteger(Number(employee_id)) || Number(employee_id) < 1)
    ) {
        return 'Employee ID must be a positive integer or null.';
    }

    return null;
}

async function getServiceOrders(req, res) {
    try {
        const orders = await serviceOrderModel.getAllServiceOrders();
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Failed to retrieve service orders.' });
    }
}

async function createServiceOrder(req, res) {
    const validationError = validateOrder(req.body);

    if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
    }

    try {
        const {
            reservation_id,
            service_id,
            employee_id,
            quantity,
            order_date,
            order_status,
            subtotal
        } = req.body;

        const id = await serviceOrderModel.createServiceOrder(
            Number(reservation_id),
            Number(service_id),
            employee_id ? Number(employee_id) : null,
            Number(quantity),
            order_date,
            order_status.trim(),
            Number(subtotal)
        );

        res.status(201).json({
            success: true,
            message: 'Service order created successfully.',
            service_order_id: id
        });
    } catch (error) {
        console.error(error.message);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                message: 'Reservation, service, or employee ID does not exist.'
            });
        }

        res.status(500).json({ success: false, message: 'Failed to create service order.' });
    }
}

async function updateServiceOrder(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ success: false, message: 'Invalid service order ID.' });
    }

    const validationError = validateOrder(req.body);

    if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
    }

    try {
        const {
            reservation_id,
            service_id,
            employee_id,
            quantity,
            order_date,
            order_status,
            subtotal
        } = req.body;

        const affectedRows = await serviceOrderModel.updateServiceOrder(
            id,
            Number(reservation_id),
            Number(service_id),
            employee_id ? Number(employee_id) : null,
            Number(quantity),
            order_date,
            order_status.trim(),
            Number(subtotal)
        );

        if (!affectedRows) {
            return res.status(404).json({
                success: false,
                message: 'Service order not found, or no changes were made.'
            });
        }

        res.status(200).json({ success: true, message: 'Service order updated successfully.' });
    } catch (error) {
        console.error(error.message);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                message: 'Reservation, service, or employee ID does not exist.'
            });
        }

        res.status(500).json({ success: false, message: 'Failed to update service order.' });
    }
}

async function deleteServiceOrder(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ success: false, message: 'Invalid service order ID.' });
    }

    try {
        const affectedRows = await serviceOrderModel.deleteServiceOrder(id);

        if (!affectedRows) {
            return res.status(404).json({ success: false, message: 'Service order not found.' });
        }

        res.status(200).json({ success: true, message: 'Service order deleted successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Failed to delete service order.' });
    }
}

module.exports = {
    getServiceOrders,
    createServiceOrder,
    updateServiceOrder,
    deleteServiceOrder
};

//Contributor: rabadon