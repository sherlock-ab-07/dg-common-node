const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const liteTicketSchema = new Schema({
    _id: Number,
    date: Date,
    latitude: Number,
    longitude: Number,
    message: String,
    state: Number,
    time: Number,
    userId: Number,
    createdDate: Date,
    updatedDate: Date,
    createdBy:String,
    updatedBy:String
});

const LiteTicket = mongoose.model('LiteTicket', liteTicketSchema, 'liteTickets');

module.exports = {
    LiteTicket
};