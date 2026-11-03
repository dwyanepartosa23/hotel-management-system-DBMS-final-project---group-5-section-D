const invoiceModel = require('../models/invoiceModel');

const MAX_AMOUNT = 99999999.99;

function parseAmount(value, blankMeansZero = false) {
    if (value === undefined || value === null || String(value).trim() === '') {
        return blankMeansZero ? 0 : null;
    }

    const amount = Number(value);

    if (!Number.isFinite(amount) || amount < 0 || amount > MAX_AMOUNT) {
        return null;
    }

    return amount;
}

function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id >= 1 ? id : null;
}

function validateInvoice(body) {
    const reservationsId = parseId(body.reservations_id);
    const roomCharges = parseAmount(body.room_charges);
    const serviceCharges = parseAmount(body.service_charges, true);
    const status = String(body.invoice_status || '').trim();
    const invoiceDate = body.invoice_date
        ? String(body.invoice_date).trim()
        : null;

    if (reservationsId === null) {
        return { error: 'A valid reservation ID is required.' };
    }

    if (roomCharges === null) {
        return { error: 'Room charges must be a number from 0 to 99,999,999.99.' };
    }

    if (serviceCharges === null) {
        return { error: 'Service charges must be a number from 0 to 99,999,999.99.' };
    }

    if (roomCharges + serviceCharges > MAX_AMOUNT) {
        return { error: 'The total amount is too large.' };
    }

    if (!status || status.length > 30) {
        return { error: 'Invoice status is required (up to 30 characters).' };
    }

    if (
        invoiceDate !== null &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(invoiceDate) ||
            Number.isNaN(new Date(invoiceDate).getTime()))
    ) {
        return { error: 'Invoice date must be a valid date (YYYY-MM-DD).' };
    }

    return {
        data: { reservationsId, invoiceDate, roomCharges, serviceCharges, status }
    };
}

function handleError(res, error, fallbackMessage) {
    console.error(error.message);

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            success: false,
            message: 'The specified reservation does not exist.'
        });
    }

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
            success: false,
            message: 'This invoice has payments and cannot be deleted.'
        });
    }

    res.status(500).json({ success: false, message: fallbackMessage });
}

async function getInvoices(req, res) {
    try {
        const invoices = await invoiceModel.getAllInvoices();
        res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        handleError(res, error, 'Failed to retrieve invoices.');
    }
}

async function getInvoice(req, res) {
    try {
        const invoiceId = parseId(req.params.id);

        if (invoiceId === null) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invoice ID.'
            });
        }

        const invoice = await invoiceModel.getInvoiceById(invoiceId);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found.'
            });
        }

        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        handleError(res, error, 'Failed to retrieve the invoice.');
    }
}

async function createInvoice(req, res) {
    try {
        const { error, data } = validateInvoice(req.body || {});

        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        const invoiceId = await invoiceModel.createInvoice(
            data.reservationsId,
            data.invoiceDate,
            data.roomCharges,
            data.serviceCharges,
            data.status
        );

        res.status(201).json({
            success: true,
            message: 'Invoice created successfully.',
            data: { invoices_id: invoiceId }
        });
    } catch (error) {
        handleError(res, error, 'Failed to create invoice.');
    }
}

async function updateInvoice(req, res) {
    try {
        const invoiceId = parseId(req.params.id);

        if (invoiceId === null) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invoice ID.'
            });
        }

        const { error, data } = validateInvoice(req.body || {});

        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        const affectedRows = await invoiceModel.updateInvoice(
            invoiceId,
            data.reservationsId,
            data.invoiceDate,
            data.roomCharges,
            data.serviceCharges,
            data.status
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Invoice updated successfully.'
        });
    } catch (error) {
        handleError(res, error, 'Failed to update invoice.');
    }
}

async function deleteInvoice(req, res) {
    try {
        const invoiceId = parseId(req.params.id);

        if (invoiceId === null) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invoice ID.'
            });
        }

        const affectedRows = await invoiceModel.deleteInvoice(invoiceId);

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Invoice deleted successfully.'
        });
    } catch (error) {
        handleError(res, error, 'Failed to delete invoice.');
    }
}

async function getInvoicePaymentReport(req, res) {
    try {
        const rows = await invoiceModel.getInvoicePaymentReport();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        handleError(res, error, 'Failed to generate the invoice and payment report.');
    }
}

module.exports = {
    getInvoices,
    getInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoicePaymentReport
};