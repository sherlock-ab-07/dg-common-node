const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-double')(mongoose);
let SchemaType = mongoose.Schema.Types;

const locationRestrictionSchema = new Schema({
    beneficiaryId: Number,
    restrictions: [
        {
            restrictionName: String,
            restrictionType: String,
            startDate: Date,
            finishDate: Date,
            repeatRules: [String],
            onAlert: Boolean,
            isActive: Boolean,
            locationDetails: [
                {
                    lat: SchemaType.Double,
                    lng: SchemaType.Double
                }
            ]
        }
    ],
    latArray: [SchemaType.Double],
    lngArray: [SchemaType.Double],
    isActive: Boolean
});

const locationRestrictionCounterSchema = new Schema({
    _id: Schema.Types.ObjectId,
    counter: Number
});

const LocationRestriction = mongoose.model('LocationRestriction', locationRestrictionSchema, 'locationRestriction');
const LocationRestrictionCounter = mongoose.model('LocationRestrictionCounter', locationRestrictionCounterSchema, 'locationRestrictionCounter');

module.exports = {
    LocationRestriction,
    LocationRestrictionCounter
};
