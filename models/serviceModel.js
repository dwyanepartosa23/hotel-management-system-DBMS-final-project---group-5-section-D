const db = require('./db');

async function getAllServices() {
    const [rows] = await db.query(
        'SELECT * FROM services ORDER BY service_id'
    );
    return rows;
}

async function createService(service_name, description, service_price, service_status) {
    const [result] = await db.query(
        `INSERT INTO services
        (service_name, description, service_price, service_status)
        VALUES (?, ?, ?, ?)`,
        [service_name, description, service_price, service_status]
    );
    return result.insertId;
}

async function updateService(service_id, service_name, description, service_price, service_status) {
    const [result] = await db.query(
        `UPDATE services
        SET service_name = ?, description = ?, service_price = ?, service_status = ?
        WHERE service_id = ?`,
        [service_name, description, service_price, service_status, service_id]
    );
    return result.affectedRows;
}

async function deleteService(service_id) {
    const [result] = await db.query(
        'DELETE FROM services WHERE service_id = ?',
        [service_id]
    );
    return result.affectedRows;
}

// âœ… Add service order to reservation
async function addServiceOrder(reservation_id, service_id, quantity = 1) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Get service details
        const [service] = await connection.query(
            'SELECT service_name, service_price, service_status FROM services WHERE service_id = ?',
            [service_id]
        );
        if (!service.length) throw new Error('Service not found');
        if (service[0].service_status !== 'Available') throw new Error('Service is not currently available');

        const unit_price = service[0].service_price;
        const subtotal = Number(unit_price) * Number(quantity); // YOUR column is `subtotal`

        // Insert order â€” matches YOUR table columns exactly
        // NEW â€” includes order_status with default value
await connection.query(`
    INSERT INTO service_orders
    (reservation_id, service_id, quantity, subtotal, order_date, order_status)
    VALUES (?, ?, ?, ?, CURDATE(), 'Pending')
`, [reservation_id, service_id, quantity, subtotal]);


        await connection.commit();
        return { success: true, service_name: service[0].service_name, total_price: subtotal };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

// âœ… Get all services for a reservation â€” uses YOUR actual column `subtotal`
async function getServicesForReservation(reservation_id) {
    const [rows] = await db.query(`
        SELECT
            so.service_order_id,
            s.service_name,
            s.description,
            so.quantity,
            so.subtotal AS total_price,
            so.subtotal
        FROM service_orders so
        INNER JOIN services s ON so.service_id = s.service_id
        WHERE so.reservation_id = ?
        ORDER BY so.service_order_id
    `, [reservation_id]);
    return rows;
}

async function getServiceTotal(reservation_id) {
    const [rows] = await db.query(`
        SELECT COALESCE(SUM(subtotal), 0) AS service_total
        FROM service_orders
        WHERE reservation_id = ?
    `, [reservation_id]);
    return rows[0].service_total;
}

module.exports = {
    getAllServices,
    createService,
    updateService,
    deleteService,
    addServiceOrder,
    getServicesForReservation,
    getServiceTotal
};
