
const express = require('express');
require('dotenv').config();

const db = require('./models/db');

const app = express();

app.use(express.json());

// Serve frontend files
app.use(express.static('public'));

// Test MySQL connection
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

// Import route files
const guestRoutes = require('./routes/guestRoutes');
const roomRoutes = require('./routes/roomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const serviceOrderRoutes = require('./routes/serviceOrderRoutes');

// Register API routes
app.use('/api/guests', guestRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/service-orders', serviceOrderRoutes);

// Handle unknown API endpoints
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found.'
    });
});

// Handle other unknown routes
app.use((req, res) => {
    res.status(404).send('Page not found.');
});

// Start server
const PORT = process.env.PORT || 1234;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
