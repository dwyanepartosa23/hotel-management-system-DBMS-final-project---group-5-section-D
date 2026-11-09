const express = require('express');
require('dotenv').config();
const path = require('path');

const db = require('./models/db');
const { addServiceOrder } = require('./models/serviceModel');

const app = express();
@@ -86,3 +87,8 @@ server.on('close', () => {
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// PAGE ROUTES — COMBINED
// ==========================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/room-records', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'room-records.html'));
});

app.get('/rooms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'rooms.html'));
});

app.get('/reservations', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reservations.html'));
});

app.get('/invoices', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'invoices.html'));
});

app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'services.html'));
});

app.get('/employees', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'employees.html'));
});

app.get('/housekeeping', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'housekeeping.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// ==========================================
// API TEST ROUTE
// ==========================================
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT DATABASE() AS database_name');
        res.status(200).json({
            success: true,
            message: 'MySQL connected successfully!',
            database: rows[0].database_name
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: 'Database connection failed.'
        });
    }
});

// ==========================================
// GUEST LOOKUP API
// ==========================================
const lookupRouter = express.Router();
lookupRouter.post('/lookup', async (req, res) => {
    try {
        const { identifier } = req.body;
        if (!identifier) {
            return res.status(400).json({
                success: false,
                message: 'Enter Email or Guest ID'
            });
        }
        const { getGuestFullDetails } = require('./models/reservationModel');
        const details = await getGuestFullDetails(identifier.trim());
        if (!details.found) {
            return res.status(404).json({
                success: false,
                message: details.message
            });
        }
        res.json({ success: true, data: details });
    } catch (err) {
        console.error('Lookup error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
app.use('/api/guest', lookupRouter);

// ==========================================
// SERVICE ORDER — Add to Invoice
// ==========================================
app.post('/api/service-orders/add', async (req, res) => {
    try {
        const { reservation_id, items } = req.body;
        if (!reservation_id || !items || !items.length) {
            return res.status(400).json({
                success: false,
                message: 'Missing order details'
            });
        }
        for (const item of items) {
            await addServiceOrder(reservation_id, item.service_id, item.quantity);
        }
        res.json({ success: true, message: 'Services added to your invoice' });
    } catch (err) {
        console.error('Order error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to place order'
        });
    }
});

// ==========================================
// OTHER API ROUTES
// ==========================================
const guestRoutes = require('./routes/guestRoutes');
const roomRoutes = require('./routes/roomRoutes');
const housekeepingRoutes = require('./routes/housekeepingRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const serviceOrderRoutes = require('./routes/serviceOrderRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reportRoutes = require('./routes/reportRoutes');
const recordRoutes = require('./routes/recordRoutes');

app.use('/api/guests', guestRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/service-orders', serviceOrderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/room-records', recordRoutes);


=======
// ==========================================
// 404 Handlers — MUST BE LAST
// ==========================================
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found.'
    });
});

app.use((req, res) => {
    res.status(404).send('Page not found.');
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 1234;

const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Guest Invoice Page: http://localhost:${PORT}/guest-invoice`);
});

server.on('error', (error) => {
    console.error('Server error:', error);
});

server.on('close', () => {
    console.log('Server closed.');
});

process.on('beforeExit', () => {
    console.log('Node.js is about to exit.');
});


app.get('/reviews', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reviews.html'));
});
=======
//Contributor: rabadon
////Module: Services
