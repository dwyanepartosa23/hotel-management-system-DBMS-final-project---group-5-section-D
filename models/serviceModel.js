
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

module.exports = {
    getAllServices,
    createService,
    updateService,
    deleteService
};
