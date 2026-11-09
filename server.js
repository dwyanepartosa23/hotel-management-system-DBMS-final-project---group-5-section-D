const express = require('express');
require('dotenv').config();
const path = require('path');

const db = require('./models/db');
const { addServiceOrder } = require('./models/serviceModel');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// PAGE ROUTES
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

app.get('/reviews', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reviews.html'));
});

// API TEST ROUTE
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

// GUEST LOOKUP API
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

// SERVICE ORDER — Add to Invoice
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

// Get all rooms with status
app.get('/api/room-records', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                r.room_id,
                r.room_number,
                CASE 
                    WHEN res.reservation_id IS NOT NULL 
                         AND res.check_out_date >= CURDATE() 
                         AND res.reservation_status = 'Confirmed'
                    THEN 'Occupied'
                    ELSE 'Available'
                END AS occupancy,
                res.reservation_id,
                res.check_in_date,
                res.check_out_date,
                g.first_name
            FROM rooms r
            LEFT JOIN reservation_rooms rr 
                ON r.room_id = rr.room_id
            LEFT JOIN reservations res 
                ON rr.reservation_id = res.reservation_id
                AND res.reservation_status = 'Confirmed'
                AND res.check_out_date >= CURDATE()
            LEFT JOIN guests g 
                ON res.guest_id = g.guest_id
            ORDER BY r.room_number
        `);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to load room records.' });
    }
});
;


// Get service orders for a specific room's active reservation
app.get('/api/room-records/:room_id/orders', async (req, res) => {
    try {
        const { room_id } = req.params;
        const [rows] = await db.query(`
            SELECT
                so.service_order_id,
                so.reservation_id,
                so.service_id,
                s.service_name,
                s.service_price AS price,
                so.quantity,
                (so.quantity * s.service_price) AS subtotal,
                so.order_status,
                so.decline_reason,
                so.created_at AS order_date
            FROM service_orders so
            JOIN services s ON so.service_id = s.service_id
            JOIN reservation_rooms rr ON so.reservation_id = rr.reservation_id
            JOIN reservations res ON rr.reservation_id = res.reservation_id
            WHERE rr.room_id = ?
              AND res.check_out_date >= CURDATE()
            ORDER BY so.created_at DESC
        `, [room_id]);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to load orders.' });
    }
});


// Mark order as served
app.patch('/api/room-records/order/:order_id/served', async (req, res) => {
    try {
        const { order_id } = req.params;
        const [result] = await db.query(`
            UPDATE service_orders
            SET order_status = 'Served'
            WHERE service_order_id = ?
        `, [order_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to update order.' });
    }
});

// Decline order with reason
app.patch('/api/room-records/order/:order_id/decline', async (req, res) => {
    try {
        const { order_id } = req.params;
        const { reason } = req.body;
        const [result] = await db.query(`
            UPDATE service_orders
            SET order_status = 'Declined', decline_reason = ?
            WHERE service_order_id = ?
        `, [reason || null, order_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to decline order.' });
    }
});

// OTHER API ROUTES
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

// 404 Handlers
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found.'
    });
});

app.use((req, res) => {
    res.status(404).send('Page not found.');
});

// START SERVER
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

//Contributor: rabadon
////Module: Services
