
const db = require('./db');

async function getAllTasks() {
    const [rows] = await db.query(`
        SELECT
            h.task_id,
            h.room_id,
            r.room_number,
            h.employee_id,
            CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
            h.task_type,
            h.assigned_date,
            h.completed_date,
            h.task_status,
            h.notes
        FROM housekeeping_tasks h
        INNER JOIN room r
            ON h.room_id = r.room_id
        LEFT JOIN employees e
            ON h.employee_id = e.employee_id
        ORDER BY h.task_id DESC
    `);

    return rows;
}

async function createTask(
    room_id,
    employee_id,
    task_type,
    assigned_date,
    completed_date,
    task_status,
    notes
) {
    const [result] = await db.query(
        `INSERT INTO housekeeping_tasks
        (room_id, employee_id, task_type, assigned_date,
        completed_date, task_status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            room_id,
            employee_id || null,
            task_type,
            assigned_date,
            completed_date || null,
            task_status,
            notes || null
        ]
    );

    return result.insertId;
}

async function updateTask(
    task_id,
    room_id,
    employee_id,
    task_type,
    assigned_date,
    completed_date,
    task_status,
    notes
) {
    const [result] = await db.query(
        `UPDATE housekeeping_tasks
        SET room_id = ?,
            employee_id = ?,
            task_type = ?,
            assigned_date = ?,
            completed_date = ?,
            task_status = ?,
            notes = ?
        WHERE task_id = ?`,
        [
            room_id,
            employee_id || null,
            task_type,
            assigned_date,
            completed_date || null,
            task_status,
            notes || null,
            task_id
        ]
    );

    return result.affectedRows;
}

async function deleteTask(task_id) {
    const [result] = await db.query(
        'DELETE FROM housekeeping_tasks WHERE task_id = ?',
        [task_id]
    );

    return result.affectedRows;
}

module.exports = {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask
};
