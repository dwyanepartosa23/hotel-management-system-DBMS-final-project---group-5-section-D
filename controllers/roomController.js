// Contributor: Dwyane Rasheed Partosa
// Module: Room Management

const roomModel = require('../models/roomModel');

async function getRooms(req, res) {
    try {
        const rooms = await roomModel.getAllRooms();
        res.status(200).json(rooms);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to retrieve rooms.' });
    }
}

async function createRoom(req, res) {
    try {
        const { room_number, floor_number, room_status, notes, room_type_id } = req.body;

        if (!room_number || !room_status || !room_type_id) {
            return res.status(400).json({
                message: 'Room number, status, and room type ID are required.'
            });
        }

        const roomId = await roomModel.createRoom(
            room_number,
            floor_number ?? null,
            room_status,
            notes ?? null,
            room_type_id
        );

        res.status(201).json({
            message: 'Room created successfully.',
            room_id: roomId
        });
    } catch (error) {
        console.error(error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                message: 'That room number already exists.'
            });
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                message: 'The specified room type does not exist.'
            });
        }

        res.status(500).json({ message: 'Failed to create room.' });
    }
}

async function updateRoom(req, res) {
    try {
        const roomId = Number(req.params.id);
        const { room_number, floor_number, room_status, notes, room_type_id } = req.body;

        if (!Number.isInteger(roomId) || roomId < 1) {
            return res.status(400).json({ message: 'Invalid room ID.' });
        }

        if (!room_number || !room_status || !room_type_id) {
            return res.status(400).json({
                message: 'Room number, status, and room type ID are required.'
            });
        }

        const affectedRows = await roomModel.updateRoom(
            roomId,
            room_number,
            floor_number ?? null,
            room_status,
            notes ?? null,
            room_type_id
        );

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Room not found or no changes made.' });
        }

        res.status(200).json({ message: 'Room updated successfully.' });
    } catch (error) {
        console.error(error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                message: 'That room number already exists.'
            });
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                message: 'The specified room type does not exist.'
            });
        }

        res.status(500).json({ message: 'Failed to update room.' });
    }
}

async function deleteRoom(req, res) {
    try {
        const roomId = Number(req.params.id);

        if (!Number.isInteger(roomId) || roomId < 1) {
            return res.status(400).json({ message: 'Invalid room ID.' });
        }

        const affectedRows = await roomModel.deleteRoom(roomId);

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Room not found.' });
        }

        res.status(200).json({ message: 'Room deleted successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Failed to delete room. It may be referenced by existing reservations.'
        });
    }
}

module.exports = {
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom
};
