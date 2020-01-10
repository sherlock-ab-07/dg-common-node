const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eLockSessionSchema = new Schema({
    imei: Number,
    connectingIPAddress: String,
    connectingPort: String,
    connectingSocket: String,
    lastConnectionTime: Date,
    initialConnectionTime: Date
});

const eLockSessionModel = mongoose.model('eLockSession', eLockSessionSchema, 'eLockSessions');

module.exports = {
    eLockSessionModel
};