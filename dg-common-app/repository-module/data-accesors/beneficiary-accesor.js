const beneficiaryQueries = require('../queries/beneficiary-query');
const beneficiaryDocumentQuery = require('../queries/beneficiary-document-query');
const {connectionCheckAndQueryExec} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const {sortWithPaginationQueryCreator, requestInModifier, insertQueryCreator, updateQueryCreator} = require('../../util-module/request-transformers');
const {TABLE_BENEFICIARIES, TABLE_ACCOUNTING, TABLE_FAMILY_INFO} = require('../../util-module/db-constants');
const COMMON_CONSTANTS = require('../../util-module/util-constants/fennix-common-constants');
const userAccessor = require('../data-accesors/user-accesor');

const getBeneficiaryByUserIdAccessor = async (req) => {
    let returnObj, modifiedQuery;
    modifiedQuery = requestInModifier(req, beneficiaryQueries.selectBeneficiaryByUserIdQuery, false);
    returnObj = await connectionCheckAndQueryExec(req, modifiedQuery);
    return returnObj;
};

const getTimeZoneDetailsAccessor = async () => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec([], beneficiaryQueries.getTimeZoneDetailsQuery());
    return returnObj;
};

const getBenefeciaryAggregator = async (req) => {
    let returnObj, modifiedQuery, groupByQuery = 'group by beneficiary_role', request;
    modifiedQuery = requestInModifier(req.userIdList, beneficiaryQueries.selectBeneficiaryByOwnerIdQuery, true);
    request = [req.languageId, ...req.userIdList];
    returnObj = await connectionCheckAndQueryExec(request, `${modifiedQuery} ${groupByQuery}`);
    return returnObj;
};

const getBeneficiaryNameFromBeneficiaryIdAccessor = async (req, language) => {
    let returnObj, modifiedQuery;
    modifiedQuery = requestInModifier(req, beneficiaryQueries.selectBeneficiaryNameFromBeneficiaryIdQuery, true);
    // console.log('modified Query' + modifiedQuery);
    let modifiedParams = [language];
    modifiedParams = [...modifiedParams, ...req];
    returnObj = await connectionCheckAndQueryExec(modifiedParams, modifiedQuery);
    return returnObj;
};
const beneficiaryListOfUnAssignedDevicesAccesor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, beneficiaryQueries.selectBeneficiariesOfUnAssignedDevicesQuery);
    return returnObj;
};

const addBeneficiaryAccessor = async (req) => {
    let returnObj, finalResponse;
    finalResponse = insertQueryCreator(req, TABLE_BENEFICIARIES, beneficiaryQueries.insertBeneficiaryQuery);
    returnObj = await connectionCheckAndQueryExec(finalResponse.valuesArray, finalResponse.modifiedInsertQuery);
    return returnObj;
};

const getBeneficiaryByBeneficiaryIdAccesor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, beneficiaryQueries.getBeneficiaryByBeneficiaryIdQuery);
    return returnObj;
};

const getBeneficiaryDetailsAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, beneficiaryQueries.getBeneficiaryDetailsQuery);
    return returnObj;
};

const getBeneifciaryIdList = async (req) => {
    let userIdNativeRoleResponse, userIds;
    userIdNativeRoleResponse = await userAccessor.getUserIdsForAllRolesAccessor(req, COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID_NATIVE_ROLE);
    userIds = userIdNativeRoleResponse['userIdsList'];
    let nativeUserRole = userIdNativeRoleResponse['nativeUserRole'];
    return getExtraQueryBasedOnUserRole(userIds, nativeUserRole, req);
};

const getExtraQueryBasedOnUserRole = async (requestList, nativeUserRole, req) => {
    let extraQuery, modifiedQuery, finalQuery, returnObj, finalRequest;
    switch (nativeUserRole) {
        case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_OPERATOR: {
            extraQuery = ` and center_id = $${requestList.length + 1} order by $${requestList.length + 2} desc nulls last offset $${requestList.length + 3} limit $${requestList.length + 4}`;
            finalRequest = [...requestList, req.query.centerId, req.query.sort, req.query.skip, req.query.limit];
            break;
        }
        default: {
            extraQuery = ` order by $${requestList.length + 1} desc nulls last offset $${requestList.length + 2} limit $${requestList.length + 3}`;
            finalRequest = [...requestList, req.query.sort, req.query.skip, req.query.limit];
        }
    }
    modifiedQuery = requestInModifier(requestList, beneficiaryQueries.getBenefeciaryIdListForOwnerAndCenterQuery, false);
    finalQuery = `${modifiedQuery} ${extraQuery}`;
    returnObj = await connectionCheckAndQueryExec(finalRequest, finalQuery);
    return returnObj;
};

// const getBeneficiaryListByOwnerId = async (req) => {
//     let returnObj, request = [...req.userIdList, req.centerId, req.skip, req.limit], modifiedQuery,
//         extraQuery = `and center_id = $${req.userIdList.length + 1} and isactive = true order by device_updated_date desc nulls last offset $${req.userIdList.length + 2} limit $${req.userIdList.length + 3}`;
//     modifiedQuery = requestInModifier(req.userIdList, beneficiaryQueries.selectBeneficiaryListByOwnerUserIdQuery, false);
//     modifiedQuery = `${modifiedQuery}${extraQuery}`;
//     returnObj = await connectionCheckAndQueryExec(request, modifiedQuery);
//     return returnObj;
// };

const getBeneficiaryListByOwnerId = async (req) => {
    let returnObj, request = [], modifiedQuery,
        extraQuery = ``;
    modifiedQuery = requestInModifier(req.userIdList, beneficiaryQueries.selectBeneficiaryListByOwnerUserIdQuery, false);
    if (req.nativeUserRole === COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_OPERATOR) {
        request = [...req.userIdList, req.centerId];
        // extraQuery = `and center_id = $${req.userIdList.length + 1} and isactive = true order by created_date desc nulls last offset $${req.userIdList.length + 2} limit $${req.userIdList.length + 3}`;
        extraQuery = `and center_id = $${req.userIdList.length + 1} and isactive = true`;
    } else {
        request = [...req.userIdList];
        extraQuery = `and isactive = true`;
    }
    modifiedQuery = `${modifiedQuery}${extraQuery} ${sortWithPaginationQueryCreator('beneficiaryid', 'desc', parseInt(req.skip, 10), parseInt(req.limit, 10),TABLE_BENEFICIARIES)}`;
    // console.log(modifiedQuery);
    // console.log(request);
    returnObj = await connectionCheckAndQueryExec(request, modifiedQuery);
    return returnObj;
};

const getBeneficiaryListForAddTicketAccessor = async (req) => {
    let returnObj, modifiedQuery;
    modifiedQuery = requestInModifier(req.userIdList, beneficiaryQueries.selectBeneficiaryListByOwnerUserIdQuery, false);
    returnObj = await connectionCheckAndQueryExec(req.userIdList, modifiedQuery);
    return returnObj;
};

// const getTotalRecordsBasedOnOwnerUserIdAndCenterAccessor = async (req) => {
//     let returnObj, modifiedQuery, extraQuery = `and center_id = $${req.userIdList.length + 1} and isactive = true`, request = [...req.userIdList, req.centerId];
//     modifiedQuery = requestInModifier(req.userIdList, beneficiaryQueries.getTotalRecordsBasedOnOwnerUserIdCenterIdQuery, false);
//     modifiedQuery = `${modifiedQuery}${extraQuery}`;
//     returnObj = await connectionCheckAndQueryExec(request, modifiedQuery);
//     return returnObj;
// };

const getTotalRecordsBasedOnOwnerUserIdAndCenterAccessor = async (req) => {
    let returnObj, modifiedQuery, extraQuery = ``, request = [];
    modifiedQuery = requestInModifier(req.userIdList, beneficiaryQueries.getTotalRecordsBasedOnOwnerUserIdCenterIdQuery, false);
    if (req.nativeUserRole === COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_OPERATOR) {
        extraQuery = `and center_id = $${req.userIdList.length + 1} and isactive = true`;
        request = [...req.userIdList, req.centerId];
    } else {
        extraQuery = `and isactive = true`;
        request = [...req.userIdList];
    }
    modifiedQuery = `${modifiedQuery}${extraQuery}`;
    returnObj = await connectionCheckAndQueryExec(request, modifiedQuery);
    return returnObj;
};

const getAllBeneficiaryDetailsAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, beneficiaryQueries.getAllBeneficiaryDetailsQuery);
    return returnObj;
};

const updateBeneficiaryAccessor = async (req) => {
    let returnObj, updatedQueryCreatorResponse, fields = Object.keys(req), request = [];
    fields.sort();
    fields.splice(fields.indexOf('beneficiaryId'), 1);
    updatedQueryCreatorResponse = updateQueryCreator('beneficiaries', fields, 'beneficiaryid');
    updatedQueryCreatorResponse.presentFields.forEach((f) => request.push(req[f]));
    request.push(req.beneficiaryId);
    returnObj = await connectionCheckAndQueryExec(request, updatedQueryCreatorResponse.query);
    return returnObj;
};

const addFamilyInfoAccessor = async (req) => {
    let returnObj, finalResponse;
    finalResponse = insertQueryCreator(req, TABLE_FAMILY_INFO, beneficiaryQueries.insertBeneficiaryQuery);
    returnObj = await connectionCheckAndQueryExec(finalResponse.valuesArray, finalResponse.modifiedInsertQuery);
    return returnObj;
};

const addAccountingAccessor = async (req) => {
    let returnObj, finalResponse;
    finalResponse = insertQueryCreator(req, TABLE_ACCOUNTING, beneficiaryQueries.insertBeneficiaryQuery);
    returnObj = await connectionCheckAndQueryExec(finalResponse.valuesArray, finalResponse.modifiedInsertQuery);
    return returnObj;
};

const getBeneficiaryDocumentByBeneficiaryIdAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, beneficiaryQueries.getBeneficiaryDocumentByBeneficiaryIdQuery);
    return returnObj;
};

const updateBeneficiaryDocumentPathAccessor = async (beneficiaryId, categoryName, documentObj) => {
    let returnObj, categoryDoc = {};
    categoryDoc[categoryName] = documentObj;
    returnObj = await beneficiaryDocumentQuery.updateBeneficiaryDocumentQuery(beneficiaryId, categoryDoc);
    return returnObj;
};

const getBeneficiaryDocumentDownloadListAccessor = async (beneficiaryId) => {
    let returnObj;
    returnObj = await beneficiaryDocumentQuery.getBeneficiaryDocumentsQuery(beneficiaryId);
    return returnObj;
};

const updateFamilyAccessor = async (req) => {
    let returnObj, updatedQueryCreatorResponse, fields = Object.keys(req), request = [];
    fields.sort();
    fields.splice(fields.indexOf('beneficiaryId'), 1);
    updatedQueryCreatorResponse = updateQueryCreator('family_info', fields, 'beneficiaryid');
    updatedQueryCreatorResponse.presentFields.forEach((f) => request.push(req[f]));
    request.push(req.beneficiaryId);
    returnObj = await connectionCheckAndQueryExec(request, updatedQueryCreatorResponse.query);
    return returnObj;
};

module.exports = {
    updateFamilyAccessor,
    getBeneficiaryDocumentDownloadListAccessor,
    updateBeneficiaryDocumentPathAccessor,
    getBeneficiaryDocumentByBeneficiaryIdAccessor,
    addAccountingAccessor,
    addFamilyInfoAccessor,
    updateBeneficiaryAccessor,
    getBeneficiaryByUserIdAccessor,
    getBenefeciaryAggregator,
    getBeneficiaryListByOwnerId,
    getBeneifciaryIdList,
    getBeneficiaryDetailsAccessor,
    getBeneficiaryNameFromBeneficiaryIdAccessor,
    getTotalRecordsBasedOnOwnerUserIdAndCenterAccessor,
    addBeneficiaryAccessor,
    getBeneficiaryListForAddTicketAccessor,
    getBeneficiaryByBeneficiaryIdAccesor,
    getAllBeneficiaryDetailsAccessor,
    getTimeZoneDetailsAccessor,
    beneficiaryListOfUnAssignedDevicesAccesor
};