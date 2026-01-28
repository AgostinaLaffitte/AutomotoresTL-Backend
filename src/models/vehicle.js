const mongoose = require('mongoose'); 
const vehicleSchema = new mongoose.Schema({
    brand: String,
    version: String,
    year: Number,
    mileage: Number, 
    images: [String],
    price: { type: Number, default: 0 },
    comment: { type: String, default: '' }
    });
 module.exports = mongoose.model('Vehicle', vehicleSchema);