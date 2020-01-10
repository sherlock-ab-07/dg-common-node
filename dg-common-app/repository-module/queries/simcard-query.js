const {simcardDetails, simCardTypeModel, simcardCounterModel} = require('../models/simcard-model');

const listUnAssignedSimcardsQuery = (query) => {
    return simcardDetails.aggregate(
        [
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                {
                                    "deviceId": {$eq: null}
                                },
                                {
                                    "deviceId": {$eq: ""}
                                }
                            ]
                        },
                        {
                            "active": true
                        },
                        {
                            "centerId": {$in: query.centerId}
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "carrier",
                    localField: "carrierByCountryId",
                    foreignField: "_id",
                    as: "carrier"

                }
            },
            {
                $unwind: {path: "$carrier", preserveNullAndEmptyArrays: true}
            },
            {
                $lookup: {
                    from: "simcardTypes",
                    localField: "simCardType",
                    foreignField: "_id",
                    as : "simcardTypes"
                }
            },
            {
                $unwind: {path: "$simcardTypes", preserveNullAndEmptyArrays: true}
            },
            {
                $project: {
                    "carrier.name": 1,
                    "phoneNo": 1,
                    "serial": 1,
                    "active": 1,
                    "simcardTypes.simcardType": 1
                }
            }
        ]
    );
};

const updateSimcardQuery = (query) => {
    return simcardDetails.update(query.where, query.update, query.upsert, query.multi);
};

const deleteSimcardQuery = (query) => {
    return simcardDetails.find(query.where).remove().exec();
};

const getSimcardDetailsQuery = (req) => {
    return simcardDetails.aggregate([
        {
            $match: {
                "centerId": {$in: req.centerIds}
            }
        },
        {
            $sort: {"createdDate": -1}
        },
        {$skip: req.skip}, {$limit: req.limit},
        {
            $lookup: {
                from: "carrierByCountry",
                localField: "carrierByCountryId",
                foreignField: "_id",
                as: "carrierByCountryDetails"
            }
        },
        {
            $unwind: "$carrierByCountryDetails"
        },
        {
            $lookup: {
                from: "carrier",
                localField: "carrierByCountryDetails.carrierId",
                foreignField: "_id",
                as: "carrier"
            }
        },
        {
            $unwind: "$carrier"
        },
        {
            $project: {
                "simCardType": 1,
                "phoneNo": 1,
                "deviceId": 1,
                "serialNp": 1,
                "carrier.name": 1,
                "carrierByCountryDetails.apn": 1,
                "centerId": 1
            }
        }
    ]);
};

const listSimcardTypesQuery = () => {
    return simCardTypeModel.find();
};

const insertSimcardQuery = (query) => {
    let simcardObj = new simcardDetails(query);
    simcardObj.save(function (err) {
        if (err) console.error(err);
    });
};

// const fetchNextPrimaryKeyQuery = () => {
//     return simcardCounterModel.find();
// };

const fetchNextPrimaryKeyQuery = () => {
    return simcardCounterModel.findOneAndUpdate({}, {$inc: {counter: 1}});
};
// //TODO: add retry logic for failure conditions
// const insertNextPrimaryKeyQuery = (req) => {
//     simcardCounterModel.update({_id: req}, {$inc: {counter: 1}}).then(doc => {
//         if (!doc) {
//             console.log('error');
//         } else {
//             console.log('success');
//         }
//     });
// };

const addDeviceIdForSimcardQuery = (query) => {
    return simcardDetails.update({_id: query.simCardId},
        {
            $set: {
                deviceId: query.deviceId
            }
        }).then(doc => {
        if (!doc) {
            console.log('error');
        } else {
            console.log('success');
        }
    });
};

// const getTotalNoOfSimcardsQuery = (query) => {
//     return simcardDetails.count({centerId: {$in : query}});
// };

const getElockSimcardDetailsQuery = (req) => {
    return simcardDetails.aggregate([
        {
            $match: {
                "centerId": {$in: req.centerIdList}
            }
        },
        {
            $lookup:
                {
                    from: "devices",
                    localField: "deviceId",
                    foreignField: "_id",
                    as: "devices"
                }
        }, {$unwind: "$devices"},
        {$match: {"devices.containerId": {$exists: true, $ne: null}}},
        {
            $sort: {"createdDate": -1}
        },
        {$skip: req.skip}, {$limit: req.limit},
        {
            $lookup: {
                from: "carrierByCountry",
                localField: "carrierByCountryId",
                foreignField: "_id",
                as: "carrierByCountryDetails"
            }
        },
        {
            $unwind: {path: "$carrierByCountryDetails", preserveNullAndEmptyArrays:true}
        },
        {
            $lookup: {
                from: "carrier",
                localField: "carrierByCountryDetails.carrierId",
                foreignField: "_id",
                as: "carrier"
            }
        },
        {
            $unwind: {path: "$carrier", preserveNullAndEmptyArrays:true}
        }, {
            $lookup: {
                from: "simcardTypes",
                localField: "simCardType",
                foreignField: "_id",
                as: "simCardTypes"
            }
        }, {$unwind: {path: "$simCardTypes", preserveNullAndEmptyArrays:true}},
        {
            $project: {
                "simCardTypes.simcardType": 1,
                "phoneNo": 1,
                "deviceId": 1,
                "serial": 1,
                "carrier.name": 1,
                "carrierByCountryDetails.apn": 1,
                "centerId": 1
            }
        }
    ])
};

const getTotalNoOfElockSimcardsQuery = (query) => {
    return simcardDetails.aggregate([{
        $match: {
            "centerId": {$in: query}
        }
    },
        {
            $lookup:
                {
                    from: "devices",
                    localField: "deviceId",
                    foreignField: "_id",
                    as: "devices"
                }
        }, {$unwind: "$devices"},
        {$match: {"devices.containerId": {$exists: true, $ne: null}}},
        {$count: "total"}
    ])
};

const getTotalNoOfSimcardsQuery = (query) => {
    return simcardDetails.aggregate([{
        $match: {
            "centerId": {$in: query}
        }
    },
        {
            $lookup:
                {
                    from: "devices",
                    localField: "deviceId",
                    foreignField: "_id",
                    as: "devices"
                }
        }, {$unwind: "$devices"},
        {$match: {"devices.beneficiaryId": {$exists: true, $ne: null}}},
        {$count: "total"}
    ])
};
const editSimcardQuery = (simCardId, req) => {
    return simcardDetails.update({
            _id: simCardId
        },
        req, {upsert: true}).then(doc => {
        if (!doc) {
            console.log('error');
        } else {
            console.log('success');
        }
    });
};

module.exports = {
    listSimcardTypesQuery,
    getSimcardDetailsQuery,
    editSimcardQuery,
    insertSimcardQuery,
    updateSimcardQuery,
    deleteSimcardQuery,
    addDeviceIdForSimcardQuery,
    listUnAssignedSimcardsQuery,
    // insertNextPrimaryKeyQuery,
    fetchNextPrimaryKeyQuery,
    getTotalNoOfElockSimcardsQuery,
    getElockSimcardDetailsQuery,
    getTotalNoOfSimcardsQuery
};
