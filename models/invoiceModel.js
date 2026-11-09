const db = require('./db');

const SELECT_INVOICES = `
    SELECT
        i.invoices_id,
        i.reservations_id,
        g.first_name AS guest_name,
        DATE_FORMAT(i.invoice_date, '%Y-%m-%d') AS invoice_date,
        i.room_charges,
        i.service_charges,
        i.total_amount,
        i.invoice_status
    FROM invoices i
    LEFT JOIN reservations r ON i.reservations_id = r.reservation_id
    LEFT JOIN guests g ON r.guest_id = g.guest_id
`;

async function getAllInvoices() {
    const [rows] = await db.query(`${SELECT_INVOICES} ORDER BY i.invoices_id`);
    return rows;
}

async function getInvoiceById(invoice_id) {
    const [rows] = await db.query(
        `${SELECT_INVOICES} WHERE i.invoices_id = ?`,
        [invoice_id]
    );
    return rows[0] || null;
}

async function createInvoice(
    reservations_id,
    invoice_date,
    room_charges,
    service_charges,
    invoice_status
) {
    const [result] = await db.query(
        `INSERT INTO invoices
        (reservations_id, invoice_date, room_charges, service_charges,
         total_amount, invoice_status)
        VALUES (?, COALESCE(?, NOW()), ?, ?, ROUND(? + ?, 2), ?)`,
        [
            reservations_id,
            invoice_date,
            room_charges,
            service_charges,
            room_charges,
            service_charges,
            invoice_status
        ]
    );

    return result.insertId;
}

async function updateInvoice(
    invoice_id,
    reservations_id,
    invoice_date,
    room_charges,
    service_charges,
    invoice_status
) {
    const [result] = await db.query(
        `UPDATE invoices
        SET reservations_id = ?,
            invoice_date = COALESCE(?, invoice_date),
            room_charges = ?,
            service_charges = ?,
            total_amount = ROUND(? + ?, 2),
            invoice_status = ?
        WHERE invoices_id = ?`,
        [
            reservations_id,
            invoice_date,
            room_charges,
            service_charges,
            room_charges,
            service_charges,
            invoice_status,
            invoice_id
        ]
    );

    return result.affectedRows;
}

async function deleteInvoice(invoice_id) {
    const [result] = await db.query(
        'DELETE FROM invoices WHERE invoices_id = ?',
        [invoice_id]
    );

    return result.affectedRows;
}

// JOIN report: every invoice with the total of its payments.
// LEFT JOIN keeps invoices that have no payments yet.
async function getInvoicePaymentReport() {
    const [rows] = await db.query(`
        SELECT
            i.invoices_id,
            i.reservations_id,
            i.invoice_date,
            i.total_amount,
            i.invoice_status,
            COALESCE(SUM(p.amount_paid), 0) AS total_paid,
            i.total_amount - COALESCE(SUM(p.amount_paid), 0)
                AS remaining_balance
        FROM invoices i
        LEFT JOIN payments p
            ON i.invoices_id = p.invoice_id
        GROUP BY
            i.invoices_id,
            i.reservations_id,
            i.invoice_date,
            i.total_amount,
            i.invoice_status
        ORDER BY i.invoice_date DESC
    `);

    return rows;
}

module.exports = {
    getAllInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoicePaymentReport
};