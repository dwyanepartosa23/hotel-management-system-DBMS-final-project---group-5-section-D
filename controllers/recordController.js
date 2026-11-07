const recordModel = require('../models/recordModel');

async function getRoomRecords(req, res) {
    try {
        const rooms = await recordModel.getAllRoomsWithStatus();
        res.json({ success: true, data: rooms });
    } catch (err) {
        console.error('Load room records error:', err);
        res.status(500).json({ success: false, message: 'Failed to load records' });
    }
}

async function getRoomOrderRecords(req, res) {
    try {
        const orders = await recordModel.getOrdersByRoomId(req.params.roomId);
        res.json({ success: true, data: orders });
    } catch (err) {
        console.error('Load order records error:', err);
        res.status(500).json({ success: false, message: 'Failed to load orders' });
    }
}

async function markOrderServed(req, res) {
    try {
        const affected = await recordModel.markOrderAsServed(req.params.orderId);
        if (!affected) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, message: 'Order marked as served' });
    } catch (err) {
        console.error('Mark served error:', err);
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
}

async function submitDeclineOrder(req, res) {
    try {
        const { reason } = req.body;
        const affected = await recordModel.declineOrderWithReason(req.params.orderId, reason);
        if (!affected) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, message: 'Order declined. Guest notified.' });
    } catch (err) {
        console.error('Decline order error:', err);
        res.status(500).json({ success: false, message: 'Failed to decline order' });
    }
}

module.exports = {
    getRoomRecords,
    getRoomOrderRecords,
    markOrderServed,
    submitDeclineOrder
};
