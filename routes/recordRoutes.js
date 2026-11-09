const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');

router.get('/', recordController.getRoomRecords);
router.get('/:roomId/orders', recordController.getRoomOrderRecords);
router.patch('/order/:orderId/served', recordController.markOrderServed);
router.patch('/order/:orderId/decline', recordController.submitDeclineOrder);

module.exports = router;
