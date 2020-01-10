const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-double')(mongoose);
let SchemaType = mongoose.Schema.Types;

const elockTripDataSchema = new Schema({
    tripId: Number,
    containerId: Number,
    deviceId: Number,
    startDate: Date,
    endDate: Date,
    startTime: SchemaType.Double,
    endTime: SchemaType.Double,
    tripName: String,
    tripStatus: String,
    tripDuration: SchemaType.Double,
    expectedStartDate: Date,
    expectedEndDate: Date,
    tripActualStartTime: Date,
    tripActualEndTime: Date,
    tripActualDuration: SchemaType.Double,
    tripOverTimeFlag: Boolean,
    tripGeoFenceFlag: Boolean,
    tripRecurringFlag: Boolean,
    tripRepeatDays: [String],
    isTripActive: Boolean,
    notificationEmail2: String,
    notificationEmail3: String,
    notificationEmail1: String,
    startAddress: {
        lat: SchemaType.Double,
        lng: SchemaType.Double,
        name: String
    },
    endAddress: {
        lat: SchemaType.Double,
        lng: SchemaType.Double,
        name: String
    },
    restrictions: [
        {
            lat: SchemaType.Double,
            lng: SchemaType.Double
        }
    ],
    latArray: [SchemaType.Double],
    lngArray: [SchemaType.Double],
    createdDate: Date,
    createdBy: Number,
    updatedDate: Date,
    updatedBy: Number,
    deviceTripDelinkDate: Date
});
const elockTripCounterSchema = new Schema({
    _id: Schema.Types.ObjectId,
    counter: Number
});

const ElocksTripDataModel = mongoose.model('ElocksTripData', elockTripDataSchema, 'elockTripData');
const ElocksTripCounterModel = mongoose.model('ElocksTripCounter', elockTripCounterSchema, 'elockTripCounter');

module.exports = {
    ElocksTripDataModel,
    ElocksTripCounterModel
};