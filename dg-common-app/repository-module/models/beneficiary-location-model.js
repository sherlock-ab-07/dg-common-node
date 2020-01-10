const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-double')(mongoose);
let SchemaType = mongoose.Schema.Types;
const locationSchema = new Schema({
    _id: Number,
    beneficiaryId: Number,
    deviceId: Number,
    deviceDate: Date,
    speed: SchemaType.Double,
    latitude: SchemaType.Double,
    longitude: SchemaType.Double
});

const locationCounterSchema = new Schema({counter: Number});
const locationCounter = mongoose.model('LocationCounter', locationCounterSchema, 'locationCounter');
const locationDetails = mongoose.model('Location', locationSchema, 'location');
module.exports = {
    locationDetails,
    locationCounter
};