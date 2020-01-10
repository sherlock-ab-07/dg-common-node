const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const liteUserTrackingSchema = new Schema({
    _id: Number,
    accuracy: Number,
    altitude: Number,
    bearing: Number,
    date: Date,
    isPlugged: Boolean,
    isTrusted: Boolean,
    latitude: Number,
    level: Number,
    locationProvider: Number,
    longitude: Number,
    provider: String,
    speed: Number,
    time: Number,
    weight: String,
    userId:Number,
    createdDate: Date,
    updatedDate: Date,
    createdBy:String,
    updatedBy:String
});

const LiteUserTracking = mongoose.model('LiteUserTracking', liteUserTrackingSchema, 'liteUserTracking');

module.exports = {
    LiteUserTracking
};