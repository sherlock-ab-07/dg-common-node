const {ElocksTripCounterModel, ElocksTripDataModel} = require('../models/trip-model');
const {ElocksLocationModel} = require('../models/container-model');

const getActiveTripDetailsByContainerIdQuery = (req) => {
    return ElocksTripDataModel.aggregate([
        {
            $match: {
                containerId: req.containerId
            }
        },
        {
            $sort: {
                createdDate: -1
            }
        },
        {
            $limit: req.tripLimit
        }
    ]);
};

const insertElockTripDataQuery = (req) => {
    return ElocksTripDataModel.collection.insert(req, function (err, doc) {
        if (err) {
            return console.error(err);
        } else {
            return "Inserted elock trip data successfully";
        }
    });
};
const fetchTripDetailsQuery = (req) => {
    console.log(req.searchValue);
    return req.searchValue ? ElocksTripDataModel.find(
        {
            $and: [
                {tripStatus: {$in: req.status}},
                {containerId: req.containerId},
                {
                    $or: [
                        {'tripName': req.searchValue},
                        {'startAddress.name': req.searchValue},
                        {'endAddress.name': req.searchValue}
                    ]
                }
            ]
        }) : ElocksTripDataModel.find({
        tripStatus: {$in: req.status},
        containerId: req.containerId
    });
};
const updateTripStatusQuery = (req) => {
    return ElocksTripDataModel.update({tripId: req.tripId}, {
        $set: req.setFields
    }, {upsert: true}).then(doc => {
        if (!doc) {
            console.log('error');
        }
    });
};
const fetchNextElockTripPrimaryKeyQuery = () => {
    return ElocksTripCounterModel.findOneAndUpdate({}, {$inc: {counter: 1}});
};

const getNotificationEmailsForTripIdQuery = (req) => {
    return ElocksTripDataModel.find({tripId: req.tripId})
};
const tripStatusAggregatorQuery = () => {
    return ElocksTripDataModel.aggregate([
        {
            $match: {isTripActive: true}
        },
        {
            $group: {_id: "$tripStatus", count: {$sum: 1}}
        }
    ]);
};

const fetchCompleteDeviceDetailsByTripIdQuery = (tripId) => {
    return ElocksLocationModel.aggregate([
        {
            $match: {
                tripId: tripId
            }
        },
        {
            $lookup: {
                from: 'elocksDeviceAttributes',
                foreignField: 'locationId',
                localField: '_id',
                as: 'deviceAttributes'
            }
        }, {
            $sort: {deviceDate: -1}
        }
    ]);
};

const getTripDetailsByTripIdQuery = (tripId) => {
    return ElocksTripDataModel.find({tripId});
};

const fetchTripDetailsFilterQuery = (req) => {
    let response;
    if (req.origin && req.destination) {
        response = ElocksTripDataModel.find(
            {
                $and: [
                    {tripStatus: {$in: req.status}},
                    {containerId: req.containerId},
                    req.origin,
                    req.destination
                ]
            });
    } else if (req.origin) {
        response = ElocksTripDataModel.find(
            {
                $and: [
                    {tripStatus: {$in: req.status}},
                    {containerId: req.containerId},
                    req.origin
                ]
            });
    } else if (req.destination) {
        response = ElocksTripDataModel.find(
            {
                $and: [
                    {tripStatus: {$in: req.status}},
                    {containerId: req.containerId},
                    req.destination
                ]
            });
    } else {
        response = ElocksTripDataModel.find(
            {
                $and: [
                    {tripStatus: {$in: req.status}},
                    {containerId: req.containerId}
                ]
            });
    }
    return response;
};


module.exports = {
    fetchTripDetailsFilterQuery,
    fetchTripDetailsQuery,
    getNotificationEmailsForTripIdQuery,
    fetchNextElockTripPrimaryKeyQuery,
    getTripDetailsByTripIdQuery,
    insertElockTripDataQuery,
    updateTripStatusQuery,
    tripStatusAggregatorQuery,
    fetchCompleteDeviceDetailsByTripIdQuery,
    getActiveTripDetailsByContainerIdQuery
};
