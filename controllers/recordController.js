const recordModel = require('../models/recordModel');

function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id >= 1 ? id : null;
}

async function getRoomRecords(req, res) {
    try {
        const rooms = await recordModel.getAllRoomsWithStatus();
        res.status(200).json({ success: true, data: rooms });
    } catch (err) {
        console.error('Load room records error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to load records.'
        });
    }
}

async function getRoomOrderRecords(req, res) {
    try {
        const roomId = parseId(req.params.roomId);

        if (roomId === null) {
            return res.status(400).json({
                success: false,
                message: 'Invalid room ID.'
            });
        }

        const orders = await recordModel.getOrdersByRoomId(roomId);
        res.status(200).json({ success: true, data: orders });
    } catch (err) {
        console.error('Load order records error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to load orders.'
        });
    }
}

async function markOrderServed(req, res) {
    try {
        const orderId = parseId(req.params.orderId);

        if (orderId === null) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID.'
            });
        }

        const affected = await recordModel.markOrderAsServed(orderId);

        if (!affected) {
            return res.status(409).json({
                success: false,
                message: 'This order cannot be completed. It may already be completed or declined.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order marked as completed.'
        });
    } catch (err) {
        console.error('Mark served error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update status.'
        });
    }
}

async function submitDeclineOrder(req, res) {
    try {
        const orderId = parseId(req.params.orderId);
        const reason = String((req.body || {}).reason || '').trim();

        if (orderId === null) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID.'
            });
        }

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'A reason is required to decline an order.'
            });
        }

        if (reason.length > 255) {
            return res.status(400).json({
                success: false,
                message: 'The reason must be 255 characters or fewer.'
            });
        }

        const affected = await recordModel.declineOrderWithReason(orderId, reason);

        if (!affected) {
            return res.status(409).json({
                success: false,
                message: 'This order cannot be declined. It may already be completed or declined.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order declined.'
        });
    } catch (err) {
        console.error('Decline order error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to decline order.'
        });
    }
}

module.exports = {
    getRoomRecords,
    getRoomOrderRecords,
    markOrderServed,
    submitDeclineOrder
};