const {listCarriersQuery} = require('../queries/carrier-query');

const listCarriersAccessor = async () => {
    let returnObj;
    returnObj = await listCarriersQuery();
    return returnObj;
};

module.exports = {
    listCarriersAccessor
};