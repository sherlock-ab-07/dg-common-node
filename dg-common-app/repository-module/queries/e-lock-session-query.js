const eLockModels = require('../models/e-lock-session-model');

const getELockSessionQuery = (eLockIdObj) => {
    return eLockModels.eLockSessionModel.find(eLockIdObj);
};

const insertELockSessionQuery = (eLockObj) => {
        return eLockModels.eLockSessionModel.update(
            {
                imei: eLockObj['imei']
            },
            {
                $set: eLockObj
            },{upsert: true}).then(doc => {
            if (!doc) {
                console.log('error');
            }
        });
};

module.exports = {
    getELockSessionQuery,
    insertELockSessionQuery
};