const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');

router.get('/employee-positions', reportController.getEmployeePositions);

module.exports = router;