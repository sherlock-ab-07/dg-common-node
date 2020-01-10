const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const liteDeviceSchema = new Schema({
    _id: Number,
    cordova: String,
    isVirtual:Boolean,
    manufacturer:String,
    model:String,
    platform:String,
    serial:String,
    token: String,
    uuid: String,
    version:String,
    userId: Number,
    createdDate: Date,
    updatedDate: Date,
    createdBy:String,
    updatedBy:String
});

const LiteDevice = mongoose.model('LiteDevice', liteDeviceSchema, 'liteDevices');

module.exports = {
    LiteDevice
};