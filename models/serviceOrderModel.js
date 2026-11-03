
const db = require('./db');

async function getAllServiceOrders() {
    const [rows] = await db.query(`
        SELECT
            so.service_order_id,
            so.reservation_id,
            so.service_id,
            s.service_name,
            so.employee_id,
            so.quantity,
            so.order_date,
            so.order_status,
            so.subtotal
        FROM service_orders so
        INNER JOIN services s ON so.service_id = s.service_id
        ORDER BY so.service_order_id
    `);

    return rows;
}

async function createServiceOrder(
    reservation_id,
    service_id,
    employee_id,
    quantity,
    order_date,
    order_status,
    subtotal
) {
    const [result] = await db.query(
        `INSERT INTO service_orders
        (reservation_id, service_id, employee_id, quantity, order_date, order_status, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [reservation_id, service_id, employee_id, quantity, order_date, order_status, subtotal]
    );

    return result.insertId;
}

async function updateServiceOrder(
    service_order_id,
    reservation_id,
    service_id,
    employee_id,
    quantity,
    order_date,
    order_status,
    subtotal
) {
    const [result] = await db.query(
        `UPDATE service_orders
        SET reservation_id = ?, service_id = ?, employee_id = ?, quantity = ?,
            order_date = ?, order_status = ?, subtotal = ?
        WHERE service_order_id = ?`,
        [
            reservation_id,
            service_id,
            employee_id,
            quantity,
            order_date,
            order_status,
            subtotal,
            service_order_id
        ]
    );

    return result.affectedRows;
}

async function deleteServiceOrder(service_order_id) {
    const [result] = await db.query(
        'DELETE FROM service_orders WHERE service_order_id = ?',
        [service_order_id]
    );

    return result.affectedRows;
}

module.exports = {
    getAllServiceOrders,
    createServiceOrder,
    updateServiceOrder,
    deleteServiceOrder
};

//Contributor: rabadon