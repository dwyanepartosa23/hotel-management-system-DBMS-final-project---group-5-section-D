
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

async function getRoom(req, res) {
    try {
        const room = await roomModel.getRoomById(req.params.id);

        if (!room) {
            return res.status(404).json({ message: 'Room not found.' });
        }

        res.status(200).json(room);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to retrieve room.' });
    }
}

async function createRoom(req, res) {
    try {
        const { room_number, floor_number, room_status, notes, room_type_id } = req.body;

        if (!room_number || !room_status || !room_type_id) {
            return res.status(400).json({ message: 'Room number, room status, and room type are required.' });
        }

        const roomId = await roomModel.createRoom(
            room_number, floor_number, room_status, notes, room_type_id
        );

        res.status(201).json({
            message: 'Room created successfully.',
            room_id: roomId
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to create room.' });
    }
}

async function updateRoom(req, res) {
    try {
        const { room_number, floor_number, room_status, notes, room_type_id } = req.body;

        if (!room_number || !room_status || !room_type_id) {
            return res.status(400).json({ message: 'Room number, room status, and room type are required.' });
        }

        const affectedRows = await roomModel.updateRoom(
            req.params.id, room_number, floor_number, room_status, notes, room_type_id
        );

        if (!affectedRows) {
            return res.status(404).json({ message: 'Room not found.' });
        }

        res.status(200).json({ message: 'Room updated successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to update room.' });
    }
}

async function deleteRoom(req, res) {
    try {
        const affectedRows = await roomModel.deleteRoom(req.params.id);

        if (!affectedRows) {
            return res.status(404).json({ message: 'Room not found.' });
        }

        res.status(200).json({ message: 'Room deleted successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to delete room.' });
    }
}

module.exports = {
    getRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom
};
