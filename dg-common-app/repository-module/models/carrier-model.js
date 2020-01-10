const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const carrierSchema = new Schema({
    _id: Number,
    name: String,
    active: Boolean,
    createdDate: Date,
    updatedDate: Date
});

const CarrierModel = mongoose.model('Carrier', carrierSchema, 'carrier');

module.exports = {
    CarrierModel
};
