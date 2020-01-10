const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const Schema = mongoose.Schema;
let SchemaType = mongoose.Schema.Types;

const locationDeviceAttributeMasterSchema = new Schema({
    _id: Schema.Types.ObjectId,
    beneficiaryId: Number,
    locationId: Number,
    deviceAttributeId: Number,
    deviceId: Number
});

const deviceSchema = new Schema({
    _id:  Number,
    beneficiaryId:  Number,
    containerId: Number,
    deviceTypeId:  Number,
    imei:  Number,
    simCardId:  Number,
    active:  Boolean,
    online: String,
    centerId:  Number,
    firmwareVersion:  String,
    createdDate:  Date,
    updatedDate:  Date
});

const deviceTypeSchema = new Schema({
    _id: Number,
    name: String,
    minSpeed: Number,
    maxHdop: Number,
    minGpsLevel: Number,
    minDiffTrackPoints: Number,
    timeout: Number,
    stationaryTimeout: Number,
    icon: String,
    mapIcon: String,
    tailColor: String,
    tailPoints: Number,
    active: Boolean,
    createdDate: Date,
    updatedDate: Date
});
const deviceAttributesSchema = new Schema({
    _id: Number,
    beneficiaryId: Number,
    deviceId: Number,
    cellId: String,
    mcc: Number,
    lac: String,
    enableAlarmStatus: Boolean,
    buzzerStatus: Boolean,
    vibratorStatus: Boolean,
    serialNumber: String,
    hdop: Number,
    locationId: Number,
    speed: SchemaType.Double,
    gpsStatus: String,
    moveDistance: Number,
    alarmStatus: String,
    beltStatus: Number,
    batteryVoltage: SchemaType.Double,
    shellStatus: Number,
    chargeStatus: Number,
    connectingSession: String,
    serverDate: Date,
    course: Number,
    satelliteNumber: Number,
    gpsFixedStatus: Number,
    batteryPercentage: SchemaType.Double,
    gsmSignal: Number,
    lowPowerStatus: Number,
    dataLoggerStatus: Number,
    stillStatus: Number,
    rfConnectionStatus: Number,
    rfgSensorStatus: Number,
    rfPlugStatus: Number,
    restrictedAreaStatus: Number,
    restrictedPersonsStatus: Number,
    deviceUpdatedDate: Date
});

const deviceCounterSchema = new Schema({
    _id: Schema.Types.ObjectId,
    counter: Number
});

const deviceAggregator = mongoose.model('Device', deviceSchema, 'devices');

const deviceTypeModel = mongoose.model('DeviceType', deviceTypeSchema, 'deviceTypes');

const DeviceAttributeModel = mongoose.model('DeviceAttribute', deviceAttributesSchema, 'deviceAttributes');

const DeviceAttributesModelCounter = mongoose.model('DeviceAttributeCounter', deviceCounterSchema, 'deviceAttributesCounter');

const devicesModel = mongoose.model('Device');

const DeviceCounter = mongoose.model('DeviceCounter', deviceCounterSchema, 'devicesCounter');

const LocationDeviceAttributeMasterModel = mongoose.model('LocationDeviceAttribute', locationDeviceAttributeMasterSchema, 'locationDeviceAttributeMaster');

module.exports = {
    deviceAggregator,
    deviceTypeModel,
    devicesModel,
    DeviceCounter,
    DeviceAttributesModelCounter,
    DeviceAttributeModel,
    LocationDeviceAttributeMasterModel
};
