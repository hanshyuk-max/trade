/**
 * Server Entry Point
 * 
 * Configures Express server, middleware (CORS, JSON), and routes.
 * Handles database connections and server startup.
 * 
 * Last Modified: 2026-01-14
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Request logging middleware (Moved to Top)
// Request logging middleware (Moved to Top)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.method === 'POST') console.log('Body:', req.body);
    next();
});

// CORS Configuration
// Allow all origins for development, but in production, you should restrict this
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('US Stock Management API');
});

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Vercel Serverless Function Export
// If running locally (node index.js), this block executes.
// If running on Vercel, this block is skipped and the app is exported.
if (require.main === module) {
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = app;
