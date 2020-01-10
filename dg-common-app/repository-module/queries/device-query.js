const {deviceAggregator, LocationDeviceAttributeMasterModel, deviceTypeModel, DeviceCounter, DeviceAttributeModel, DeviceAttributesModelCounter} = require('../models/device-model');
const {LocationDeviceAttributeContainerMasterModel} = require('../models/container-model');
const userIdDeviceAggregatorQuery = (query) => {
    return deviceAggregator.aggregate().match({"beneficiaryId": {$in: query}})
        .group({
            _id: "$active",
            count: {$sum: 1}
        });
};

const getDeviceDetailsForListOfBeneficiariesQuery = (query) => {
    return deviceAggregator.aggregate()
        .match({
            "beneficiaryId": {$in: query}
        })
        .lookup({
            from: "deviceTypes",
            localField: "deviceTypeId",
            foreignField: "_id",
            as: "deviceType"
        }).project({
            "_id": 1,
            "imei": 1,
            "beneficiaryId": 1,
            "deviceType.name": 1
        });
};

const deviceDetailsByBeneficiaryIdQuery = (query) => {
    return LocationDeviceAttributeMasterModel.aggregate([
        {
            $match: {"beneficiaryId": {$in: query}}
        },
        {
            $lookup: {
                from: "deviceAttributes",
                localField: "deviceAttributeId",
                foreignField: "_id",
                as: "deviceAttributes"
            }
        },
        {$unwind: {path: "$deviceAttributes", preserveNullAndEmptyArrays: true}},
        {
            $lookup: {
                from: "location",
                localField: "locationId",
                foreignField: "_id",
                as: "location"
            }
        },
        {$unwind: {path: "$location", preserveNullAndEmptyArrays: true}},
        {
            $lookup: {
                from: "devices",
                localField: "deviceId",
                foreignField: "_id",
                as: "device"
            }
        },
        {$unwind: {path: "$device", preserveNullAndEmptyArrays: true}},
        {
            $lookup: {
                from: "locationRestriction",
                localField: "beneficiaryId",
                foreignField: "beneficiaryId",
                as: "locationRestriction"
            }
        },
        {$unwind: {path: "$locationRestriction", preserveNullAndEmptyArrays: true}}
    ]);
    // return LocationDeviceAttributeMasterModel.aggregate([
    //     {
    //         $match: {"beneficiaryId": {$in: query}}
    //     },
    //     {
    //         $lookup: {
    //             from: "deviceAttributes",
    //             localField: "deviceAttributeId",
    //             foreignField: "_id",
    //             as: "deviceAttributes"
    //         }
    //     },
    //     {$unwind: "$deviceAttributes"},
    //     {
    //         $lookup: {
    //             from: "location",
    //             localField: "locationId",
    //             foreignField: "_id",
    //             as: "location"
    //         }
    //     },
    //     {$unwind: "$location"},
    //     {
    //         $lookup: {
    //             from: "devices",
    //             localField: "deviceId",
    //             foreignField: "_id",
    //             as: "device"
    //         }
    //     },
    //     {$unwind: "$device"}
    // ]);
};

const updateLocationDeviceAttributeMasterQuery = (req) => {
    return LocationDeviceAttributeMasterModel.update({beneficiaryId: req.beneficiaryId}, {
        $set: {
            locationId: req.locationId,
            deviceAttributeId: req.deviceAttributeId,
            deviceId: req.deviceId
        }
    }, {upsert: true}).then(doc => {
        if (!doc) {
            console.log('error');
        }
        // else {
        //     console.log('success');
        // }
    });
};

const unlinkLocationMasterForBeneficiaryQuery = async (req) => {
    return LocationDeviceAttributeMasterModel.update(
        {
            beneficiaryId: req
        },
        {
            $unset: {beneficiaryId: 1}
        },
        {
            multi: true
        }).then(doc => {
        if (!doc) {
            console.log('error');
        } else {
            console.log('success');
        }
    });
};

const getBeneficiaryIdByImeiQuery = (query) => {
    return deviceAggregator.find({imei: query, active: true}, {_id: 1, beneficiaryId: 1});
};

const getContainerIdByImeiQuery = (req) => {
    return deviceAggregator.aggregate([
        {
            $match: {
                $and: [
                    {
                        imei: req.deviceIMEIId
                    },
                    {
                        active: true
                    },
                    {
                        containerId: {
                            $exists: true
                        }
                    },
                    {
                        $or: [
                            {
                                beneficiaryId: null
                            },
                            {
                                beneficiaryId: {
                                    $exists: false
                                }
                            }]
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "elockTripData",
                localField: "_id",
                foreignField: "deviceId",
                as: "trips"
            }
        },
        {$unwind: "$trips"},
        {
            $match: {
                $or: [{$and: [{"trips.tripActualStartTime": {$lte: new Date(req.deviceUpdatedDate)}}, {"trips.tripStatus": "IN_PROGRESS"}]},
                    {$and: [{"trips.tripActualStartTime": {$lte: new Date(req.deviceUpdatedDate)}}, {"trips.tripActualEndTime": {$gte: new Date(req.deviceUpdatedDate)}}, {"trips.tripStatus": "COMPLETED"}]}]
            }
        }]);
    //TODO - Abhay - replace this
    // deviceTripDelinkDate -- use this instead of actualEndDate
};
const listDevicesQuery = (req) => {
    return deviceAggregator.aggregate([
        {
            $match: {
                "centerId": {$in: req.centerIds},
                "beneficiaryId": {$exists: true, $ne: null}
            }
        },
        {$sort: {"createdDate": -1}},
        {$skip: req.skip}, {$limit: req.limit},
        {
            $lookup: {
                from: "deviceTypes",
                localField: "deviceTypeId",
                foreignField: "_id",
                as: "deviceTypes"
            }
        },
        {
            $lookup: {
                from: "simcards",
                localField: "simCardId",
                foreignField: "_id",
                as: "simcards"
            }
        },
        {
            $unwind: "$deviceTypes"
        },
        {
            $unwind: "$simcards"
        },
        {
            $project: {
                "imei": 1,
                "deviceTypes.name": 1,
                "simcards.phoneNo": 1,
                "active": 1,
                "centerId": 1,
                "beneficiaryId": 1
            }
        }
    ])
};

const listDeviceTypesQuery = () => {
    return deviceTypeModel.find(
        {
            "active": true
        },
        {
            "name": 1
        }
    );
};
const unlinkDeviceForBeneficiaryQuery = async (req) => {
    return deviceAggregator.update(
        {
            $and: [{beneficiaryId: req}, {active: true}]
        },
        {
            $unset: {beneficiaryId: 1}
        },
        {
            multi: true
        }).then(doc => {
        if (!doc) {
            console.log('error');
        } else {
            console.log('success');
        }
    });
};

const getTotalNoOfDevicesQuery = (query) => {
    return deviceAggregator.count({centerId: {$in: query}, beneficiaryId: {$exists: true, $ne: null}});
};

const updateDeviceAttributeQuery = (req) => {
    let deviceAttribute = new DeviceAttributeModel(req);
    deviceAttribute.save(function (err) {
        if (err) return console.error(err);
    });
};

const getDeviceAttributeCounterQuery = () => {
    return DeviceAttributesModelCounter.findOneAndUpdate({}, {$inc: {counter: 1}});
};

// const updateDeviceCounterQuery = (req) => {
//     DeviceAttributesModelCounter.update({_id: req}, {$inc: {counter: 1}}).then(doc => {
//         if (!doc) {
//             console.log('error');
//         }
//         // else {
//         //     console.log('success');
//         // }
//     });
// };

const insertDeviceQuery = (req) => {
    let deviceObj = new deviceAggregator(req);
    deviceObj.save(function (err) {
        if (err) return console.error(err);
    });
};

// const listUnAssignedDevicesQuery = (req) => {
//     return deviceAggregator.aggregate([
//         {
//             $match :{
//                 $and : [
//                     {
//                         $or : [
//                             {
//                                 "beneficiaryId": { $eq:null }
//                             },
//                             {
//                                 "beneficiaryId": { $eq:0 }
//                             },
//                             {"beneficiaryId":{$exists:false}}
//                         ]
//                     },
//                     {
//                         "active":true
//                     },
//                     {
//                         "centerId": req.centerId
//                     }
//                 ]}},
//         {
//             $lookup: {
//                 from: "deviceTypes",
//                 localField: "deviceTypeId",
//                 foreignField: "_id",
//                 as : "deviceTypes"
//             }
//         },{$unwind: "$deviceTypes"},
//         {$lookup: {
//                 from:"simcards",
//                 localField:"simCardId",
//                 foreignField:"_id",
//                 as: "simcards"
//             }},{$unwind:"$simcards"},
//         {
//             $project: {
//                 "imei":1,
//                 "deviceTypes.name":1,
//                 "simcards.phoneNo":1,
//                 "active":1
//
//             }
//         }
//     ]);
// };
const listUnAssignedDevicesQuery = (req) => {
    return deviceAggregator.aggregate([
        {
            $match: {
                $and: [
                    {
                        $or: [
                            {
                                "beneficiaryId": {$eq: null}
                            },
                            {
                                "beneficiaryId": {$eq: 0}
                            },
                            {"beneficiaryId": {$exists: false}}
                        ]
                    },
                    {
                        "active": true
                    },
                    {
                        "centerId": req.centerId
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "deviceTypes",
                localField: "deviceTypeId",
                foreignField: "_id",
                as: "deviceTypes"
            }
        }, {$unwind: "$deviceTypes"},
        {$match: {"deviceTypes.name": {$in: ["Celular", "Grillete"]}}},
        {
            $lookup: {
                from: "simcards",
                localField: "simCardId",
                foreignField: "_id",
                as: "simcards"
            }
        }, {$unwind: "$simcards"},
        {
            $project: {
                "imei": 1,
                "deviceTypes.name": 1,
                "simcards.phoneNo": 1,
                "active": 1
            }
        }
    ]);
};
// const fetchNextPrimaryKeyQuery = () => {
//     return DeviceCounter.find();
// };
//
// //TODO: add retry logic for failure conditions
// const insertNextPrimaryKeyQuery = (req) => {
//     DeviceCounter.update({_id: req}, {$inc: {counter: 1}}).then(doc => {
//         if (!doc) {
//             console.log('error');
//         }
//         // else {
//         //     console.log('success');
//         // }
//     });
// };

const getDeviceDetailsByDeviceIdQuery = (req) => {
    return deviceAggregator.aggregate([
        {
            $match: {
                _id: req.deviceId
            }
        },
        {
            $lookup: {
                from: 'simcards',
                localField: 'simCardId',
                foreignField: '_id',
                as: 'simcards'
            }
        },
        {
            $lookup: {
                from: 'deviceTypes',
                localField: 'deviceTypeId',
                foreignField: '_id',
                as: 'deviceType'
            }
        },
        {$unwind: '$simcards'},
        {$unwind: '$deviceType'},
        {
            $project: {
                'imei': 1,
                'active': 1,
                'simcards.phoneNo': 1,
                'simcards.simCardType': 1,
                'firmwareVersion': 1,
                'deviceType.name': 1
            }
        }
    ])
};
const fetchNextPrimaryKeyQuery = () => {
    return DeviceCounter.findOneAndUpdate({}, {$inc: {counter: 1}});
};
const getDeviceDetailsByBeneficiaryIdQuery = (req) => {
    return LocationDeviceAttributeMasterModel.aggregate([
        {
            $match: {"beneficiaryId": req.beneficiaryId}
        },
        {
            $lookup: {
                from: "deviceAttributes",
                localField: "deviceAttributeId",
                foreignField: "_id",
                as: "deviceAttributes"
            }
        },
        {$unwind: "$deviceAttributes"},
        {
            $lookup: {
                from: "devices",
                localField: "deviceId",
                foreignField: "_id",
                as: "device"
            }
        },
        {$unwind: "$device"}
    ]);
};

const updateDeviceWithBeneficiaryIdQuery = async (req) => {
    console.log(req);
    return deviceAggregator.update({_id: req.deviceId},
        {
            $set: {
                beneficiaryId: req.beneficiaryId
            }
        }).then(doc => {
        if (!doc) {
            console.log('error');
        } else {
            console.log('success');
        }
    });
};

const getDeviceDetailsForListOfContainersQuery = (query) => {
    return deviceAggregator.aggregate()
        .match({
            "containerId": {$in: query}
        })
        .lookup({
            from: "deviceTypes",
            localField: "deviceTypeId",
            foreignField: "_id",
            as: "deviceType"
        }).project({
            "_id": 1,
            "imei": 1,
            "containerId": 1,
            "deviceType.name": 1
        });
};

const updateDeviceWithContainerIdQuery = async (req) => {
    return deviceAggregator.update({_id: req.deviceId},
        {
            $set: {
                containerId: req.containerId
            }
        }).then(doc => {
        if (!doc) {
            console.log('error');
        } else {
            console.log('success');
        }
    });
};

const unlinkDeviceForContainerQuery = async (req) => {
    return deviceAggregator.update(
        {
            $and: [{containerId: req}, {active: true}]
        },
        {
            $unset: {containerId: 1}
        },
        {
            multi: true
        }).then(doc => {
        if (!doc) {
            console.log('error');
        } else {
            console.log('success');
        }
    });
};

const unlinkLocationMasterForContainerQuery = async (req) => {
    return LocationDeviceAttributeContainerMasterModel.update(
        {
            containerId: req
        },
        {
            $unset: {containerId: 1}
        },
        {
            multi: true
        }).then(doc => {
        if (!doc) {
            console.log('error');
        } else {
            console.log('success');
        }
    });
};

const listUnAssignedDevicesForContainerQuery = () => {
    return deviceAggregator.aggregate([
        {
            $match: {
                $and: [
                    {
                        $or: [
                            {
                                "containerId": {$eq: null}
                            },
                            {
                                "containerId": {$eq: 0}
                            },
                            {"containerId": {$exists: false}}
                        ]
                    },
                    {
                        "active": true
                    },
                    {
                        "beneficiaryId": {$exists: false}
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "deviceTypes",
                localField: "deviceTypeId",
                foreignField: "_id",
                as: "deviceTypes"
            }
        }, {$unwind: "$deviceTypes"},
        {$match: {"deviceTypes.name": {$in: ["E-Locks"]}}},
        {
            $lookup: {
                from: "simcards",
                localField: "simCardId",
                foreignField: "_id",
                as: "simcards"
            }
        }, {$unwind: "$simcards"},
        {
            $project: {
                "imei": 1,
                "deviceTypes.name": 1,
                "simcards.phoneNo": 1,
                "active": 1
            }
        }
    ]);
};

const deviceDetailsByContainerIdQuery = (query) => {
    return LocationDeviceAttributeContainerMasterModel.aggregate([
        {
            $match: {"containerId": {$in: query}}
        },
        {
            $lookup: {
                from: "elocksDeviceAttributes",
                localField: "deviceAttributeId",
                foreignField: "_id",
                as: "deviceAttributes"
            }
        },
        {$unwind: "$deviceAttributes"},
        {
            $lookup: {
                from: "elocksLocation",
                localField: "locationId",
                foreignField: "_id",
                as: "location"
            }
        },
        {$unwind: "$location"},
        {
            $lookup: {
                from: "devices",
                localField: "deviceId",
                foreignField: "_id",
                as: "device"
            }
        },
        {$unwind: "$device"}
    ]);
};
const getDeviceIMEIByContainerIDQuery = (containerId) => {
    return deviceAggregator.find({containerId});
};
const checkIfDeviceIsPresentQuery = (req) => {
    return deviceAggregator.count({imei: req});
};
const getPhoneNoForContainerQuery = (req) => {
    return deviceAggregator.aggregate([
        {
            $match: {containerId: req, active: true}
        },
        {
            $lookup: {
                from: "simcards",
                localField: "simCardId",
                foreignField: "_id",
                as: "simcards"
            }
        }, {$unwind: "$simcards"},
        {
            $project: {
                "containerId": 1,
                "simcards.phoneNo": 1
            }
        }
    ])
};

const listElockDevicesQuery = (req) => {
    return deviceAggregator.aggregate([
        {
            $match: {
                "centerId": {$in: req.centerIds},
                "containerId": {$exists: true, $ne: null},
                "active": true
            }
        },
        {$sort: {"createdDate": -1}},
        {$skip: req.skip}, {$limit: req.limit},
        {
            $lookup: {
                from: "deviceTypes",
                localField: "deviceTypeId",
                foreignField: "_id",
                as: "deviceTypes"
            }
        },
        {
            $lookup: {
                from: "simcards",
                localField: "simCardId",
                foreignField: "_id",
                as: "simcards"
            }
        },
        {
            $unwind: "$deviceTypes"
        },
        {
            $unwind: "$simcards"
        },
        {
            $project: {
                "imei": 1,
                "deviceTypes.name": 1,
                "simcards.phoneNo": 1,
                "active": 1,
                "centerId": 1,
                "containerId": 1
            }
        }
    ])
};

const getTotalNoOfElockDevicesQuery = (query) => {
    return deviceAggregator.count({centerId: {$in: query}, containerId: {$exists: true, $ne: null}});
};
const editDeviceQuery = (deviceId, req) => {
    return deviceAggregator.update({
            _id: deviceId
        },
        req, {upsert: true}).then(doc => {
        if (!doc) {
            console.log('error');
        } else {
            console.log('success');
        }
    });
};


const listUnAssignedDevicesForGlobalAdminQuery = () => {
    return deviceAggregator.aggregate([
        {
            $match: {
                $and: [
                    {
                        $or: [
                            {
                                "beneficiaryId": {$eq: null}
                            },
                            {
                                "beneficiaryId": {$eq: 0}
                            },
                            {"beneficiaryId": {$exists: false}}
                        ]
                    },
                    {
                        "active": true
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "deviceTypes",
                localField: "deviceTypeId",
                foreignField: "_id",
                as: "deviceTypes"
            }
        }, {$unwind: "$deviceTypes"},
        {$match: {"deviceTypes.name": {$in: ["Celular", "Grillete"]}}},
        {
            $lookup: {
                from: "simcards",
                localField: "simCardId",
                foreignField: "_id",
                as: "simcards"
            }
        }, {$unwind: "$simcards"},
        {
            $project: {
                "imei": 1,
                "deviceTypes.name": 1,
                "simcards.phoneNo": 1,
                "active": 1
            }
        }
    ]);
};

module.exports = {
    getTotalNoOfElockDevicesQuery,
    listUnAssignedDevicesForGlobalAdminQuery,
    editDeviceQuery,
    listElockDevicesQuery,
    getDeviceDetailsForListOfContainersQuery,
    updateDeviceWithContainerIdQuery,
    unlinkDeviceForContainerQuery,
    checkIfDeviceIsPresentQuery,
    getPhoneNoForContainerQuery,
    unlinkLocationMasterForContainerQuery,
    listUnAssignedDevicesForContainerQuery,
    userIdDeviceAggregatorQuery,
    deviceDetailsByBeneficiaryIdQuery,
    getDeviceDetailsForListOfBeneficiariesQuery,
    listDevicesQuery,
    updateDeviceWithBeneficiaryIdQuery,
    listDeviceTypesQuery,
    insertDeviceQuery,
    deviceDetailsByContainerIdQuery,
    fetchNextPrimaryKeyQuery,
    getDeviceAttributeCounterQuery,
    updateDeviceAttributeQuery,
    getBeneficiaryIdByImeiQuery,
    unlinkLocationMasterForBeneficiaryQuery,
    unlinkDeviceForBeneficiaryQuery,
    listUnAssignedDevicesQuery,
    getDeviceDetailsByBeneficiaryIdQuery,
    getDeviceDetailsByDeviceIdQuery,
    updateLocationDeviceAttributeMasterQuery,
    getTotalNoOfDevicesQuery,
    getContainerIdByImeiQuery,
    getDeviceIMEIByContainerIDQuery
};
