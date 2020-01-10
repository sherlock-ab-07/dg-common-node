const restrictionQuery = require('../queries/restriction-query');

const addLocationRestrictionAccessor = async (req,counter) => {
    let returnObj;
    returnObj = await restrictionQuery.addLocationRestrictionQuery(req,counter);
    return returnObj;
};

const fetchLocRestrictionNextPrimaryKeyAccessor = async () => {
    let returnObj;
    returnObj = await restrictionQuery.fetchNextPrimaryKeyQuery();
    return returnObj;
};

const fetchLocationRestrictionAccessor = async (req) => {
    let returnObj;
    returnObj = await restrictionQuery.fetchLocationRestrictionQuery(req);
    return returnObj;
};


const updateLocationRestrictionAccessor = async (req) => {
    let returnObj;
    returnObj = await restrictionQuery.updateLocationRestrictionDetailsQuery(req);
    return returnObj;
};

module.exports = {
    updateLocationRestrictionAccessor,
    addLocationRestrictionAccessor,
    fetchLocationRestrictionAccessor,
    fetchLocRestrictionNextPrimaryKeyAccessor
};