const reportModel = require('../models/reportModel');

async function getEmployeePositions(req, res) {
    try {
        const employees = await reportModel.getEmployeePositions();

        res.status(200).json({
            success: true,
            data: employees
        });
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve employee positions.'
        });
    }
}

module.exports = {
    getEmployeePositions
};