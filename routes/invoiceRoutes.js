const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.get('/', invoiceController.getInvoices);
router.get('/payment-report', invoiceController.getInvoicePaymentReport); // ✅ ADD THIS
router.get('/:id', invoiceController.getInvoice);
router.post('/', invoiceController.createInvoice);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;