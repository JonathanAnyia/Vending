const mongoose = require('mongoose');


const VendorSchema = new mongoose.Schema({
businessName: { type: String, required: true },
businessCategory: { type: String, required: true },
businessLocation: { type: String, required: true },
email: { type: String, required: true, unique: true, lowercase: true },
password: { type: String, required: true },
createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Vendor', VendorSchema);