const db = require('./db');

async function getEmployeePositions() {
    const [rows] = await db.query(`
        SELECT
            e.employee_id,
            e.first_name,
            e.last_name,
            e.email,
            p.position_name
        FROM employees e
        INNER JOIN position p
            ON e.position_id = p.position_id
        ORDER BY p.position_name, e.last_name
    `);

    return rows;
}

module.exports = {
    getEmployeePositions
};