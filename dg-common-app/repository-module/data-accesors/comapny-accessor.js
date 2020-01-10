const {connectionCheckAndQueryExec} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const {insertQueryCreator, updateQueryCreator, requestInModifier} = require('../../util-module/request-transformers');
const {TABLE_COMPANY} = require('../../util-module/db-constants');
const companyQueries = require('../queries/company-query');

const addCompanyAccessor = async (req) => {
    let returnObj, finalResponse;
    finalResponse = await insertQueryCreator(req, TABLE_COMPANY, companyQueries.addCompanyQuery);
    returnObj = await connectionCheckAndQueryExec(finalResponse.valuesArray, finalResponse.modifiedInsertQuery);
    return returnObj;
};

const editCompanyAccessor = async (req) => {
    let returnObj, updatedQueryCreatorResponse, fields = Object.keys(req), request = [];
    fields.sort();
    fields.splice(fields.indexOf('companyId'), 1);
    updatedQueryCreatorResponse = updateQueryCreator(TABLE_COMPANY, fields, 'company_id');
    updatedQueryCreatorResponse.presentFields.forEach((f) => request.push(req[f]));
    request.push(req.companyId);
    console.log(updatedQueryCreatorResponse);
    console.log(request);
    returnObj = await connectionCheckAndQueryExec(request, updatedQueryCreatorResponse.query);
    return returnObj;
};

// const listCompanyAccessor = async (req) => {
//     let returnObj;
//     returnObj = await connectionCheckAndQueryExec(req, companyQueries.listCompanyQuery);
//     return returnObj;
// };
const listCompanyAccessor = async (req) => {
    let returnObj, extraQuery, modifiedQuery, finalQuery;
    modifiedQuery = requestInModifier(req.userIdList, companyQueries.listCompanyQuery, true);
    extraQuery = ` order by updated_date desc nulls last offset $${req.userIdList.length + 2} limit $${req.userIdList.length + 3}`;
    finalQuery = `${modifiedQuery} ${extraQuery}`;
    returnObj = await connectionCheckAndQueryExec([req.languageId, ...req.userIdList, req.skip, req.limit], finalQuery);
    return returnObj;
};
const getCompanyDetailsAccessor = async (req) => {
    let returnObj, modifiedQuery;
    modifiedQuery = requestInModifier(req.companyIdList, companyQueries.getCompanyDetailsQuery, true);
    returnObj = await connectionCheckAndQueryExec([req.languageId, ...req.companyIdList], modifiedQuery);
    return returnObj;
};

const totalNoOfCompaniesAccessor = async (req) => {
    let returnObj, modifiedQuery;
    modifiedQuery = requestInModifier(req, companyQueries.totalNoOfCompaniesQuery, false);
    console.log(modifiedQuery);
    console.log(req);
    returnObj = await connectionCheckAndQueryExec(req, modifiedQuery);
    return returnObj;
};

module.exports = {
    addCompanyAccessor,
    getCompanyDetailsAccessor,
    editCompanyAccessor,
    listCompanyAccessor,
    totalNoOfCompaniesAccessor
};
