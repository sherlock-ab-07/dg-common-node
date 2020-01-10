const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const ticketSchema = new Schema({
    _id: Number,
    userId: Number,
    centerId: Number,
    beneficiaryId: Number,
    locationId: Number,
    messages: [
        {
            userId: Number,
            message: String,
            timestamp: Date
        }
    ],
    ticketStatus: String,
    withAlerts: Boolean,
    previousOwner: Number,
    createdDate: Date,
    updatedDate: Date
});
const ticketCounterSchema = new Schema({
    _id: Schema.Types.ObjectId,
    counter: Number
});

const beneficiaryViolationSchema = new Schema({
    beneficiaryId: Number,
    totalWarnings: Number,
    totalViolations: Number,
    allViolations: {violationName: String, violationCount: Number},
    majorWarning: {violationName: String, warningCount: Number},
    allWarning: {violationName: String, warningCount: Number},
    currentViolation: String,
});

const alertTypesSchema = new Schema({
    _id: Number,
    type: String
});

const AlertTypes = mongoose.model('AlertTypes', alertTypesSchema, 'alertTypes');
const TicketCounter = mongoose.model('TicketCounter', ticketCounterSchema, 'ticketsCounter');
const ticketAggregator = mongoose.model('Ticket', ticketSchema, 'tickets');
const beneficiaryViolationModel = mongoose.model('beneficiaryViolation', beneficiaryViolationSchema, 'beneficiaryViolations');

module.exports = {
    ticketAggregator,
    TicketCounter,
    beneficiaryViolationModel,
    AlertTypes
};