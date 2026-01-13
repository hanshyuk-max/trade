const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
