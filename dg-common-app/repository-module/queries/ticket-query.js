const {ticketAggregator, TicketCounter, beneficiaryViolationModel, AlertTypes} = require('../models/ticket-model');

const fetchViolationsForBeneficiaryIdQuery = (query) => {
    return beneficiaryViolationModel.find({'beneficiaryId': query});
};

const userIdTicketAggregatorQuery = (query) => {
    return ticketAggregator.aggregate([
        {
            $match: {
                "userId": {$in: query.userIds}
            }
        },
        {
            $group: {
                _id: "$ticketStatus",
                count: {$sum: 1}
            }
        }
    ]);
};

const addTicketQuery = (req) => {
    let ticketObj = new ticketAggregator(req);
    ticketObj.save(function (err) {
        if (err) return console.error(err);
    });
};

// const fetchNextPrimaryKeyQuery = () => {
//     return TicketCounter.find();
// };
//
//
// //TODO: add retry logic for failure conditions
// const insertNextPrimaryKeyQuery = (req) => {
//     TicketCounter.update({_id: req}, {$inc: {counter: 1}}).then(doc => {
//         if (!doc) {
//             console.log('error');
//         } else {
//             console.log('success');
//         }
//     });
// };

const fetchNextPrimaryKeyQuery = () => {
    return TicketCounter.findOneAndUpdate({}, {$inc:{counter:1}});
};

const userIdTicketDetailsBasedOnTicketStatusQuery = (query) => {
    return ticketAggregator.find(
        {
            "userId": query.userId,
            "centerId": query.centerId,
            "ticketStatus": query.ticketStatus
        });
};

//TODO: sort based on updatedDate later after testing
const listTicketsQuery = (query) => {
    return ticketAggregator.aggregate().match(
        {
            "userId": {$in: query.userId}
        }
    ).sort({"createdDate": -1})
        .skip(query.skip)
        .limit(query.limit)
        .lookup(
            {
                from: "devices",
                localField: "beneficiaryId",
                foreignField: "beneficiaryId",
                as: "device"
            }
        )
        .lookup(
            {
                from: "deviceTypes",
                localField: "device.deviceTypeId",
                foreignField: "_id",
                as: "deviceType"
            }
        )
        .project(
            {
                "beneficiaryId": 1,
                "userId": 1,
                "device.imei": 1,
                "locationId": 1,
                "withAlerts": 1,
                "ticketName": 1,
                "alertType": 1,
                "deviceType.name": 1,
                "readStatus": 1,
                "createdDate": 1,
                "updatedDate": 1,
                "device._id": 1
            }
        );
};

const getTotalNoOfTicketsQuery = (query) => {
    return ticketAggregator.count({userId : {$in: query.userId}});
};

const ticketDetailsBasedOnTicketIdQuery = (query) => {
    return ticketAggregator.find(
        {
            "_id": query.ticketId
        }
    );
};

//TODO: sort based on updatedDate later after testing
const listTicketsForDownloadQuery = (query) => {
    return ticketAggregator.aggregate().match(
        {
            "userId": {$in: query.userId}
        }
    ).sort({"createdDate": -1})
        .lookup(
            {
                from: "devices",
                localField: "beneficiaryId",
                foreignField: "beneficiaryId",
                as: "device"
            }
        )
        .lookup(
            {
                from: "deviceTypes",
                localField: "device.deviceTypeId",
                foreignField: "_id",
                as: "deviceType"
            }
        )
        .project(
            {
                "beneficiaryId": 1,
                "userId": 1,
                "device.imei": 1,
                "locationId": 1,
                "withAlerts": 1,
                "ticketName": 1,
                "alertType": 1,
                "deviceType.name": 1,
                "readStatus": 1,
                "createdDate": 1,
                "updatedDate": 1
            }
        );
};
const getTicketDetailsBasedOnBeneficiaryIdQuery = (query)=>{
return ticketAggregator.find({
        $and : [{
            beneficiaryId: query,
            ticketStatus : {$ne:'RESOLVED'}
        }]
    });
};

const updateTicketQuery = (query) => {
    ticketAggregator.update({_id: query.ticketId},
        {
            $set: {
                ticketStatus: query.obj.ticketStatus,
                updatedDate: query.obj.updatedDate
            },
            $push: {messages: query.obj.messages}
        }, {upsert: true}).then(doc => {
        if (!doc) {
            console.log('error');
        } else {
            console.log('success');
        }
    });
};

const getTicketDetailsByStatusAndBenIdQuery = async (req) => {
  return ticketAggregator.find(
      {
          $and:[
              {
                  ticketStatus: req.status,
                  beneficiaryId:req.beneficiaryId
              }
          ]
      });
};

const listAlertTypesQuery = () => {
    return AlertTypes.find();
};

module.exports = {
    listAlertTypesQuery,
    userIdTicketAggregatorQuery,
    userIdTicketDetailsBasedOnTicketStatusQuery,
    listTicketsQuery,
    fetchNextPrimaryKeyQuery,
    // insertNextPrimaryKeyQuery,
    addTicketQuery,
    updateTicketQuery,
    getTicketDetailsBasedOnBeneficiaryIdQuery,
    listTicketsForDownloadQuery,
    ticketDetailsBasedOnTicketIdQuery,
    fetchViolationsForBeneficiaryIdQuery,
    getTicketDetailsByStatusAndBenIdQuery,
    getTotalNoOfTicketsQuery
};