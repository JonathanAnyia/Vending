const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');


dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());


// Connect to DB
connectDB();


// Routes
app.use('/api/auth', require('./src/routes/auth'));


// Health
app.get('/', (req, res) => res.json({ ok: true, message: 'Auth service running' }));


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




// === FILE: src/config/db.js ===
const mongoose = require('mongoose');


const connectDB = async () => {
try {
const conn = await mongoose.connect(process.env.MONGODB_URI, {
// options are default in Mongoose v6+, but left here for clarity
});
console.log(`MongoDB connected: ${conn.connection.host}`);
} catch (err) {
console.error('MongoDB connection error:', err.message);
process.exit(1);
}
};


module.exports = connectDB;