const simCardQueries = require('../queries/simcard-query');

const listUnAssignedSimcardsAccessor = async (req) => {
    let returnObj;
    returnObj = await simCardQueries.listUnAssignedSimcardsQuery(req);
    return returnObj;
};

const listSimcardTypesAccessor = async () => {
    let returnObj;
    returnObj = await simCardQueries.listSimcardTypesQuery();
    return returnObj;
};

const getSimcardDetailsAccessor = async (req) => {
    let responseObj;
    responseObj = await simCardQueries.getSimcardDetailsQuery(req);
    return responseObj;
};

const addSimcardAccessor = async (req) => {
    let returnObj;
    returnObj = await simCardQueries.insertSimcardQuery(req);
    return returnObj;
};

const fetchNextPrimaryKeyAccessor = async () => {
    let returnObj;
    returnObj = await simCardQueries.fetchNextPrimaryKeyQuery();
    return returnObj;
};

// const insertNextPrimaryKeyAccessor = async (req) => {
//     await simCardQueries.insertNextPrimaryKeyQuery(req);
// };
const addDeviceIdForSimcardAccessor = async (req) => {
    await simCardQueries.addDeviceIdForSimcardQuery(req);
};

const getTotalNoOfSimcardsAccessor = async (req) => {
    let responseObj;
    responseObj = await simCardQueries.getTotalNoOfSimcardsQuery(req);
    return responseObj;
};

const getTotalNoOfElockSimcardsAccessor = async (req) => {
    let responseObj;
    responseObj = await simCardQueries.getTotalNoOfElockSimcardsQuery(req);
    return responseObj;
};
const getElockSimcardDetailsAccessor = async (req) => {
    let responseObj;
    responseObj = await simCardQueries.getElockSimcardDetailsQuery(req);
    return responseObj;
};

const editSimcardAcessor = async (simCardId, req) => {
    let returnObj;
    returnObj = await simCardQueries.editSimcardQuery(simCardId, req);
    return returnObj;
};

module.exports = {
    editSimcardAcessor,
    getElockSimcardDetailsAccessor,
    getTotalNoOfElockSimcardsAccessor,
    listUnAssignedSimcardsAccessor,
    addDeviceIdForSimcardAccessor,
    listSimcardTypesAccessor,
    addSimcardAccessor,
    getSimcardDetailsAccessor,
    // insertNextPrimaryKeyAccessor,
    fetchNextPrimaryKeyAccessor,
    getTotalNoOfSimcardsAccessor
};