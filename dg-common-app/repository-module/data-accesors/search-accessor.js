const searchQueries = require('../queries/search-query');

const searchAccessor = async (req) => {
    let returnObj;
    returnObj = await searchQueries.searchQuery(req);
    return returnObj;
};

const insertSearchAccessor = async (req) => {
    let returnObj;
    returnObj = await searchQueries.insertSearchQuery(req);
    return returnObj;
};

const insertOrUpdateSearchAccessor = async (req) => {
    let returnObj;
    returnObj = await searchQueries.insertOrUpdateSearchQuery(req);
    return returnObj;
};

module.exports = {
    searchAccessor,
    insertSearchAccessor,
    insertOrUpdateSearchAccessor
};
