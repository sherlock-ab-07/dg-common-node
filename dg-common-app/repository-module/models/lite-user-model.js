const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const liteUserSchema = new Schema({
    _id: Number,
    accuracy: Number,
    altitude: Number,
    bearing: Number,
    city: String,
    country: String,
    date: Date,
    email: String,
    firstName: String,
    height: String,
    homeAddress: String,
    isPlugged: Boolean,
    isTrusted: Boolean,
    lastName: String,
    latitude: Number,
    level: Number,
    locationProvider: Number,
    longitude: Number,
    mobile: String,
    photo: String,
    profileRef: String,
    providence: String,
    provider: String,
    skin: String,
    speed: Number,
    telephone: String,
    time: Number,
    userId: Number,
    weight: String,
    createdDate: Date,
    updatedDate: Date,
    createdBy:String,
    updatedBy:String
});

const LiteUser = mongoose.model('LiteUser', liteUserSchema, 'liteUsers');

module.exports = {
    LiteUser
};