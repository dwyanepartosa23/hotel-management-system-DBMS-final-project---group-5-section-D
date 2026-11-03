const db = require('./db');

async function getAllEmployees() {
    const [rows] = await db.query(
        `SELECT
            employees.employee_id,
            employees.first_name,
            employees.last_name,
            employees.phone,
            employees.email,
            employees.position_id,
            position.position_name
        FROM employees
        LEFT JOIN position
            ON employees.position_id = position.position_id
        ORDER BY employees.employee_id`
    );

    return rows;
}

async function createEmployee(first_name, last_name, phone, email, position_id) {
    const [result] = await db.query(
        `INSERT INTO employees
        (first_name, last_name, phone, email, position_id)
        VALUES (?, ?, ?, ?, ?)`,
        [first_name, last_name, phone, email, position_id]
    );

    return result.insertId;
}

async function updateEmployee(employee_id, first_name, last_name, phone, email, position_id) {
    const [result] = await db.query(
        `UPDATE employees
        SET first_name = ?, last_name = ?, phone = ?, email = ?, position_id = ?
        WHERE employee_id = ?`,
        [first_name, last_name, phone, email, position_id, employee_id]
    );

    return result.affectedRows;
}

async function deleteEmployee(employee_id) {
    const [result] = await db.query(
        'DELETE FROM employees WHERE employee_id = ?',
        [employee_id]
    );

    return result.affectedRows;
}

module.exports = {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
};