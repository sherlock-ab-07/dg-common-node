const eLockSessionQueries = require('../queries/e-lock-session-query');

const getELockSessionAccessor = async (req) => {
    let returnObj;
    returnObj = await eLockSessionQueries.getELockSessionQuery(req);
    return returnObj;
};

const insertELockSessionAccessor = async (req) => {
    let returnObj;
    returnObj = await eLockSessionQueries.insertELockSessionQuery(req);
    return returnObj;
};

module.exports = {
    insertELockSessionAccessor,
    getELockSessionAccessor
};