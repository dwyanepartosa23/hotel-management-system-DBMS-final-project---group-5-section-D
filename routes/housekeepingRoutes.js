
const express = require('express');
const router = express.Router();
const housekeepingController = require('../controllers/housekeepingController');

router.get('/', housekeepingController.getTasks);
router.post('/', housekeepingController.createTask);
router.put('/:id', housekeepingController.updateTask);
router.delete('/:id', housekeepingController.deleteTask);

module.exports = router;
