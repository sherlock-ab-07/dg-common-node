const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const liteCounterSchema = new Schema({
    _id: Schema.Types.ObjectId,
    userCounter: Number,
    ticketCounter: Number,
    deviceCounter: Number,
    userTrackingCounter: Number
});

const LiteCounter = mongoose.model('LiteCounter', liteCounterSchema, 'liteCounter');

module.exports = {
    LiteCounter
};