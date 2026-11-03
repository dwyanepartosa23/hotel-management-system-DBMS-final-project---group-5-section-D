
const express = require('express');
require('dotenv').config();

const db = require('./models/db');

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.json({
        message: 'Hotel Management API is running!'
    });
});

app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT DATABASE() AS database_name'
        );

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

app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found.'
    });
});

app.use((req, res) => {
    res.status(404).send('Page not found.');
});

const PORT = process.env.PORT || 1234;

const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
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
