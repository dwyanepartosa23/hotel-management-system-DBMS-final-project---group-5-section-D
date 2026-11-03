
const serviceModel = require('../models/serviceModel');

async function getServices(req, res) {
    try {
        const services = await serviceModel.getAllServices();

        res.status(200).json({
            success: true,
            data: services
        });
    } catch (error) {
        console.error('Get services error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve services.'
        });
    }
}

async function createService(req, res) {
    try {
        const {
            service_name,
            description,
            service_price,
            service_status
        } = req.body;

        const price = Number(service_price);

        if (
            !service_name?.trim() ||
            service_price === undefined ||
            service_price === '' ||
            !Number.isFinite(price) ||
            price < 0 ||
            !service_status?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'A service name, valid non-negative price, and status are required.'
            });
        }

        const id = await serviceModel.createService(
            service_name.trim(),
            description || null,
            price,
            service_status.trim()
        );

        res.status(201).json({
            success: true,
            message: 'Service created successfully.',
            service_id: id
        });
    } catch (error) {
        console.error('Create service error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'That service name already exists.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create service.'
        });
    }
}

async function updateService(req, res) {
    try {
        const id = Number(req.params.id);

        const {
            service_name,
            description,
            service_price,
            service_status
        } = req.body;

        const price = Number(service_price);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID.'
            });
        }

        if (
            !service_name?.trim() ||
            service_price === undefined ||
            service_price === '' ||
            !Number.isFinite(price) ||
            price < 0 ||
            !service_status?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'A service name, valid non-negative price, and status are required.'
            });
        }

        const affectedRows = await serviceModel.updateService(
            id,
            service_name.trim(),
            description || null,
            price,
            service_status.trim()
        );

        if (!affectedRows) {
            return res.status(404).json({
                success: false,
                message: 'Service not found, or no changes were made.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service updated successfully.'
        });
    } catch (error) {
        console.error('Update service error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'That service name already exists.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update service.'
        });
    }
}

async function deleteService(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID.'
            });
        }

        const affectedRows = await serviceModel.deleteService(id);

        if (!affectedRows) {
            return res.status(404).json({
                success: false,
                message: 'Service not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully.'
        });
    } catch (error) {
        console.error('Delete service error:', error);

        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
                success: false,
                message: 'This service is linked to existing service orders and cannot be deleted.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to delete service.'
        });
    }
}

module.exports = {
    getServices,
    createService,
    updateService,
    deleteService
};
