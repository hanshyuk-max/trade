const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Request logging middleware (Moved to Top)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(cors({
    origin: '*', // Allow all origins for debugging
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('US Stock Management API');
});

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const configRoutes = require('./routes/config');
const messageRoutes = require('./routes/messages');

console.log("Loading auth routes...");
console.log("Loading user routes...");

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/config', configRoutes);
app.use('/api/messages', messageRoutes); // Config Management Routes

// Only listen if not running in Vercel (local development)
if (require.main === module) {
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = app;
