const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');


dotenv.config();


const app = express();
app.use(cors({origin: '*'}));
app.use(express.json());


// Connect to DB
console.log('MONGODB_URI from .env:', process.env.MONGODB_URI);
connectDB();


// Routes
app.use('/api/auth', require('./src/routes/auth'));

// Health
app.get('/', (req, res) => res.json({ ok: true, message: 'Auth service running' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));