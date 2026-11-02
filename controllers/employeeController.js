 const employeeModel = require('../models/employeeModel');

async function getEmployees(req, res) {
    try {
        const employees = await employeeModel.getAllEmployees();

        res.status(200).json({
            success: true,
            data: employees
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve employees.'
        });
    }
}

async function createEmployee(req, res) {
    try {
        const { first_name, last_name, phone, email, position_id } = req.body;

        if (!first_name || !last_name || !position_id) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, and position ID are required.'
            });
        }

        const id = await employeeModel.createEmployee(
            first_name,
            last_name,
            phone || null,
            email || null,
            position_id
        );

        res.status(201).json({
            success: true,
            message: 'Employee created successfully.',
            employee_id: id
        });
    } catch (error) {
        console.error(error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'That employee email is already registered.'
            });
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                message: 'The specified position ID does not exist.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create employee.'
        });
    }
}

async function updateEmployee(req, res) {
    try {
        const employee_id = Number(req.params.id);
        const { first_name, last_name, phone, email, position_id } = req.body;

        if (!Number.isInteger(employee_id) || employee_id < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID.'
            });
        }

        if (!first_name || !last_name || !position_id) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, and position ID are required.'
            });
        }

        const affectedRows = await employeeModel.updateEmployee(
            employee_id,
            first_name,
            last_name,
            phone || null,
            email || null,
            position_id
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found, or no changes were made.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Employee updated successfully.'
        });
    } catch (error) {
        console.error(error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'That employee email is already registered.'
            });
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                message: 'The specified position ID does not exist.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update employee.'
        });
    }
}

async function deleteEmployee(req, res) {
    try {
        const employee_id = Number(req.params.id);

        if (!Number.isInteger(employee_id) || employee_id < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID.'
            });
        }

        const affectedRows = await employeeModel.deleteEmployee(employee_id);

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully.'
        });
    } catch (error) {
        console.error(error.message);

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                success: false,
                message: 'This employee is linked to other records and cannot be deleted.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to delete employee.'
        });
    }
}

module.exports = {
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
 };