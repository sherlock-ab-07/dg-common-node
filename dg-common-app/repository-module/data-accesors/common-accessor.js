const commonQueries = require('../queries/common-query');
const {connectionCheckAndQueryExec} = require('../../util-module/custom-request-reponse-modifiers/response-creator');

const getDownloadMapperAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, commonQueries.getDownloadMapperQuery);
    return returnObj;
};

const getDropdownAccessor = async (req) => {
    let responseObj;
    responseObj = await connectionCheckAndQueryExec(req, commonQueries.getDropdownDataQuery);
    return responseObj;
};

const getDropdownValueByDropdownIdAccessor = async (req) => {
    let responseObj;
    responseObj = await connectionCheckAndQueryExec(req, commonQueries.getDropdownValueByDropdownIdQuery);
    return responseObj;
};

const getContainerCheckboxMetadataAccessor = async (req) => {
    let responseObj;
    responseObj = await connectionCheckAndQueryExec(req, commonQueries.getContainerCheckboxMetadataQuery);
    return responseObj;
};

module.exports = {
    getDownloadMapperAccessor,
    getDropdownAccessor,
    getContainerCheckboxMetadataAccessor,
    getDropdownValueByDropdownIdAccessor
};