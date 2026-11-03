
const housekeepingModel = require('../models/housekeepingModel');

async function getTasks(req, res) {
    try {
        const tasks = await housekeepingModel.getAllTasks();

        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve housekeeping tasks.'
        });
    }
}

async function createTask(req, res) {
    try {
        const {
            room_id,
            employee_id,
            task_type,
            assigned_date,
            completed_date,
            task_status,
            notes
        } = req.body;

        if (!room_id || !task_type || !assigned_date || !task_status) {
            return res.status(400).json({
                success: false,
                message: 'Room, task type, assigned date, and task status are required.'
            });
        }

        const taskId = await housekeepingModel.createTask(
            room_id,
            employee_id || null,
            task_type,
            assigned_date,
            completed_date || null,
            task_status,
            notes || null
        );

        res.status(201).json({
            success: true,
            message: 'Housekeeping task created successfully.',
            task_id: taskId
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create housekeeping task.'
        });
    }
}

async function updateTask(req, res) {
    try {
        const {
            room_id,
            employee_id,
            task_type,
            assigned_date,
            completed_date,
            task_status,
            notes
        } = req.body;

        if (!room_id || !task_type || !assigned_date || !task_status) {
            return res.status(400).json({
                success: false,
                message: 'Room, task type, assigned date, and task status are required.'
            });
        }

        const affectedRows = await housekeepingModel.updateTask(
            req.params.id,
            room_id,
            employee_id || null,
            task_type,
            assigned_date,
            completed_date || null,
            task_status,
            notes || null
        );

        if (!affectedRows) {
            return res.status(404).json({
                success: false,
                message: 'Housekeeping task not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Housekeeping task updated successfully.'
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update housekeeping task.'
        });
    }
}

async function deleteTask(req, res) {
    try {
        const affectedRows = await housekeepingModel.deleteTask(req.params.id);

        if (!affectedRows) {
            return res.status(404).json({
                success: false,
                message: 'Housekeeping task not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Housekeeping task deleted successfully.'
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to delete housekeeping task.'
        });
    }
}

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask
};
