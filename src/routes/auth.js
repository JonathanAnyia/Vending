const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');


const Vendor = require('../models/Vendor');
const Customer = require('../models/Customer');


// Helpers
const createToken = (payload) => {
return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};


// ----------------------
// VENDOR SIGNUP
// POST /api/auth/vendor/signup
// ----------------------
router.post(
'/vendor/signup',
[
body('businessName').notEmpty().withMessage('businessName is required'),
body('businessCategory').notEmpty().withMessage('businessCategory is required'),
body('businessLocation').notEmpty().withMessage('businessLocation is required'),
body('email').isEmail().withMessage('Valid email is required'),
body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match')
],
async (req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });


const { businessName, businessCategory, businessLocation, email, password } = req.body;


try {
let existing = await Vendor.findOne({ email });
if (existing) return res.status(400).json({ msg: 'Vendor with this email already exists' });


const salt = await bcrypt.genSalt(10);
const hashed = await bcrypt.hash(password, salt);


const vendor = new Vendor({ businessName, businessCategory, businessLocation, email, password: hashed });
await vendor.save();


const token = createToken({ id: vendor._id, role: 'vendor' });
res.json({ token, user: { id: vendor._id, businessName, email, role: 'vendor' } });
} catch (err) {
console.error(err.message);
res.status(500).send('Server error');
}
}
);

// ----------------------
// CUSTOMER SIGNUP
// POST /api/auth/customer/signup
// ----------------------
router.post(
'/customer/signup',
[
body('name').notEmpty().withMessage('name is required'),
body('email').isEmail().withMessage('Valid email is required'),
body('phone').notEmpty().withMessage('phone is required'),
body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match')
],
async (req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });


const { name, email, phone, password } = req.body;


try {
let existing = await Customer.findOne({ email });
if (existing) return res.status(400).json({ msg: 'Customer with this email already exists' });


const salt = await bcrypt.genSalt(10);
const hashed = await bcrypt.hash(password, salt);


const customer = new Customer({ name, email, phone, password: hashed });
await customer.save();


const token = createToken({ id: customer._id, role: 'customer' });
res.json({ token, user: { id: customer._id, name, email, role: 'customer' } });
} catch (err) {
console.error(err.message);
res.status(500).send('Server error');
}
}
);

// ----------------------
// LOGIN (shared for both)
// POST /api/auth/login
// body: { email, password, role }
// role must be 'vendor' or 'customer'
// ----------------------
router.post(
'/login',
[
body('email').isEmail().withMessage('Valid email is required'),
body('password').notEmpty().withMessage('password is required'),
body('role').isIn(['vendor', 'customer']).withMessage('role must be vendor or customer')
],
async (req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });


const { email, password, role } = req.body;


try {
const Model = role === 'vendor' ? Vendor : Customer;
const user = await Model.findOne({ email });
if (!user) return res.status(400).json({ msg: 'Invalid credentials' });


const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });


const token = createToken({ id: user._id, role });


// return minimal profile depending on role
const profile = role === 'vendor'
? { id: user._id, businessName: user.businessName, email: user.email, role }
: { id: user._id, name: user.name, email: user.email, phone: user.phone, role };


res.json({ token, user: profile });
} catch (err) {
console.error(err.message);
res.status(500).send('Server error');
}
}
);

// Protected route example
// GET /api/auth/me
// header: x-auth-token
// ----------------------
const authMiddleware = require('../middleware/auth');
router.get('/me', authMiddleware, async (req, res) => {
try {
const { id, role } = req.user;
const Model = role === 'vendor' ? Vendor : Customer;
const user = await Model.findById(id).select('-password');
if (!user) return res.status(404).json({ msg: 'User not found' });
res.json({ user, role });
} catch (err) {
console.error(err.message);
res.status(500).send('Server error');
}
});


module.exports = router;