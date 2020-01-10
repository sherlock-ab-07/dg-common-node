const { LiteCounter } = require('../models/lite-util-model')

const fetchUserCounter = async () => {
    const obj = await LiteCounter.findOneAndUpdate({}, { $inc: { userCounter: 1 } });
     return obj["userCounter"];
}

const fetchTicketCounter = async () => {
     const obj = await LiteCounter.findOneAndUpdate({}, { $inc: { ticketCounter: 1 } })
     return obj["ticketCounter"];
     
}

const fetchDeviceCounter = async () => {
    const obj = await LiteCounter.findOneAndUpdate({}, { $inc: { deviceCounter: 1 } })
    return obj["deviceCounter"];
}

const fetchUserTrackingCounter = async () => {
    const obj = await LiteCounter.findOneAndUpdate({}, { $inc: { userTrackingCounter: 1 } })
    return obj["userTrackingCounter"];
}

module.exports = {
    fetchUserCounter,
    fetchTicketCounter,
    fetchDeviceCounter,
    fetchUserTrackingCounter
};