const {LocationRestriction, LocationRestrictionCounter} = require('../models/restriction-model');

const addLocationRestrictionQuery = (req) => {
    let locationRestrictionObj = new LocationRestriction(req);
    locationRestrictionObj.save(function (err) {
        if (err) return console.error(err);
    });
};

const fetchNextPrimaryKeyQuery = () => {
    return LocationRestrictionCounter.findOneAndUpdate({}, {$inc: {counter: 1}});
};

const fetchLocationRestrictionQuery = (query) => {
    return LocationRestriction.find({$and: [{beneficiaryId: query}, {isActive: true}]});
};


// const updateLocationRestrictionDetailsQuery = (request, counter) => {
//     return LocationRestriction.update(
//         {beneficiaryId:request.beneficiaryId},
//         {
//             $set: {
//                 // _id: 20,
//                 // primaryKeyResponse['_doc']['counter'],
//                 beneficiaryId: request['beneficiaryId'],
//                 restrictionName: request['restrictionName'],
//                 restrictionType: request['restrictionType'],
//                 // startDate: request['startDate'],
//                 // finishDate: request['finishDate'],
//                 repeatRules: request['repeatRules'],
//                 // onAlert: request['onAlert'],
//                 isActive: true,
//                 locationDetails: request['locationDetails']
//             },
//             $setOnInsert: {_id: counter}
//             // req
//             // $setOnInsert: {_id: counter}
//         }, {upsert: true}).then((doc) => {
//             if (!doc) {
//                 console.log('error');
//             }
//     });
//
// };

const updateLocationRestrictionDetailsQuery = (request) => {
    return LocationRestriction.findOneAndUpdate(
        {beneficiaryId:request.beneficiaryId},
        request
        ,{upsert: true}).then((doc) => {
        if (!doc) {
            console.log('error');
        } else {
            console.log('success');
        }
    });

};

module.exports = {
    updateLocationRestrictionDetailsQuery,
    addLocationRestrictionQuery,
    fetchNextPrimaryKeyQuery,
    fetchLocationRestrictionQuery
};