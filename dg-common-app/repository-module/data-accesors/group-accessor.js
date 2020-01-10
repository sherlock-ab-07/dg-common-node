const {listGroupsQuery} = require('../queries/group-query');
const {requestInModifier} = require('../../util-module/request-transformers');
const {connectionCheckAndQueryExec} = require('../../util-module/custom-request-reponse-modifiers/response-creator');

const listGroupsAccessor = async (centerIds) => {
    let modifiedQuery, returnObj;
    modifiedQuery = requestInModifier(centerIds, listGroupsQuery, false);
    returnObj = await connectionCheckAndQueryExec(centerIds, modifiedQuery);
    return returnObj;
};

module.exports = {
    listGroupsAccessor
};