// Contributor: Dwyane Rasheed Partosa
// Module: Room Management

const db = require('./db');

async function getAllRooms() {
    const [rows] = await db.query(`
        SELECT
            r.room_id,
            r.room_number,
            r.floor_number,
            r.room_status,
            r.notes,
            r.room_type_id,
            rt.type_name,
            rt.description,
            rt.capacity,
            rt.price_per_night
        FROM room r
        INNER JOIN room_types rt
            ON r.room_type_id = rt.room_type_id
        ORDER BY r.room_id
    `);

    return rows;
}

// Create a new room
async function createRoom(room_number, floor_number, room_status, notes, room_type_id) {
    const [result] = await db.query(
        `INSERT INTO room
        (room_number, floor_number, room_status, notes, room_type_id)
        VALUES (?, ?, ?, ?, ?)`,
        [room_number, floor_number, room_status, notes, room_type_id]
    );

    return result.insertId;
}

// Update an existing room
async function updateRoom(room_id, room_number, floor_number, room_status, notes, room_type_id) {
    const [result] = await db.query(
        `UPDATE room
        SET room_number = ?, floor_number = ?, room_status = ?, notes = ?, room_type_id = ?
        WHERE room_id = ?`,
        [room_number, floor_number, room_status, notes, room_type_id, room_id]
    );

    return result.affectedRows;
}

// Delete a room
async function deleteRoom(room_id) {
    const [result] = await db.query(
        'DELETE FROM room WHERE room_id = ?',
        [room_id]
    );

    return result.affectedRows;
}

module.exports = {
    getAllRooms,
    createRoom,
    updateRoom,
    deleteRoom
};
