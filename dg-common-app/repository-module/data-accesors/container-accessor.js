const containerQueries = require('../queries/container-query');
const {connectionCheckAndQueryExec} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const {insertQueryCreator, requestInModifier, sortWithPaginationQueryCreator} = require('../../util-module/request-transformers');
const {TABLE_CONTAINER} = require('../../util-module/db-constants');
const COMMON_CONSTANTS = require('../../util-module/util-constants/fennix-common-constants');
const {updateQueryCreator, pgDataFilterQueryCreator} = require('../../util-module/request-transformers');
const {notNullCheck, objectHasPropertyCheck, arrayNotEmptyCheck} = require('../../util-module/data-validators');
const {getDeviceIMEIByContainerIDQuery} = require('../queries/device-query');
const addContainerDetailsAccessor = async (req) => {
    let returnObj, finalResponse;
    finalResponse = await insertQueryCreator(req, TABLE_CONTAINER, containerQueries.addContainerDetailsQuery);
    // console.log(finalResponse.modifiedInsertQuery);
    returnObj = await connectionCheckAndQueryExec(finalResponse.valuesArray, finalResponse.modifiedInsertQuery);
    return returnObj;
};

// const listContainersAccessor = async (req) => {
//     let returnObj, modifiedQuery, finalQuery;
//     modifiedQuery = requestInModifier(req.userIdList, containerQueries.listContainersQuery, false);
//     console.log(modifiedQuery);
//     finalQuery = `${modifiedQuery} ${sortWithPaginationQueryCreator(req.sortBy, 'desc', parseInt(req.skip, 10), parseInt(req.limit, 10))}`;
//     console.log(finalQuery);
//     console.log(req.userIdList);
//     returnObj = await connectionCheckAndQueryExec([...req.userIdList], finalQuery);
//     return returnObj;
// };

const getTotalNoOfContainersAccessor = async (req) => {
    let returnObj, modifiedQuery, request, extraQuery = ``, finalQuery;
    modifiedQuery = requestInModifier(req.userIdList, containerQueries.getTotalNoOfContainersQuery, false);
    if (req.nativeUserRole === COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_OPERATOR) {
        request = [...req.userIdList, req.centerId];
        extraQuery = ` and center_id = $${req.userIdList.length + 1}`;
    } else {
        request = [...req.userIdList];
    }
    finalQuery = `${modifiedQuery} ${extraQuery}`;
    returnObj = await connectionCheckAndQueryExec(request, finalQuery);
    return returnObj;
};

const getContainerMapHistoryAccessor = async (req) => {
    let returnObj;
    returnObj = await containerQueries.getContainerMapHistoryQuery(req);
    return returnObj;
};


const getTotalNoOfContainersForMapAccessor = async (req) => {
    let returnObj, modifiedQuery, extraQuery = ``, request, finalQuery;
    modifiedQuery = requestInModifier(req.userIdList, containerQueries.getTotalNoOfContainersForMapQuery, false);
    if (req.nativeUserRole === COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_OPERATOR) {
        request = [...req.userIdList, req.centerId];
        extraQuery = ` and center_id = $${req.userIdList.length + 1}`;
    } else {
        request = [...req.userIdList];
    }
    finalQuery = `${modifiedQuery} ${extraQuery}`;
    returnObj = await connectionCheckAndQueryExec(request, finalQuery);
    return returnObj;
};

const listUnAssignedContainersAccessor = async (req) => {
    let returnObj, modifiedQuery;
    modifiedQuery = requestInModifier(req, containerQueries.listUnassignedContainersQuery, false);
    console.log(modifiedQuery);
    console.log(req);
    returnObj = await connectionCheckAndQueryExec(req, modifiedQuery);
    return returnObj;
};

const getContainerForDeviceIdAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, containerQueries.getContainerForDeviceIdQuery);
    return returnObj;
};

const updateContainerAccessor = async (req) => {
    let returnObj, updatedQueryCreatorResponse, fields = Object.keys(req), request = [];
    fields.sort();
    fields.splice(fields.indexOf('containerId'), 1);
    updatedQueryCreatorResponse = updateQueryCreator('container', fields, 'container_id');
    updatedQueryCreatorResponse.presentFields.forEach((f) => request.push(req[f]));
    request.push(req.containerId);
    console.log(request);
    console.log(updatedQueryCreatorResponse);
    returnObj = await connectionCheckAndQueryExec(request, updatedQueryCreatorResponse.query);
    return returnObj;
};

// const getContainerIdListAccessor = async (req) => {
//     let returnObj, finalQuery, modifiedQuery, extraQuery = ``, request = [];
//     modifiedQuery = requestInModifier(req.userIdList, containerQueries.listContainersQuery, true);
//     if (req.nativeUserRole === COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_OPERATOR) {
//         request = [req.languageId, ...req.userIdList, parseInt(req.centerId, 10)];
//         extraQuery = `and center_id = $${req.userIdList.length + 2}`;
//     } else {
//         request = [req.languageId, ...req.userIdList];
//     }
//     finalQuery = `${modifiedQuery} ${extraQuery} ${sortWithPaginationQueryCreator(req.sortBy, 'desc', req.offset, req.limit, TABLE_CONTAINER)}`;
//     console.log(request);
//     console.log(finalQuery);
//     returnObj = await connectionCheckAndQueryExec(request, finalQuery);
//     return returnObj;
// };

const containerDeviceUpdateAccessor = async (data) => {
    let returnObj;
    returnObj = await containerQueries.updateLocationDeviceAttributeMasterQuery(req);
    return returnObj;
};


const getContainerDocumentByContainerIdAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, containerQueries.getContainerDocumentByContainerIdQuery);
    return returnObj;
};

const containerLocationUpdateAccessor = async (data) => {
    let returnObj;
    returnObj = await containerQueries.insertElocksLocationQuery(data);
    return returnObj;
};

const containerDeviceAttributesUpdateAccessor = async (data) => {
    let returnObj;
    returnObj = await containerQueries.insertElocksDeviceAttributesQuery(data);
    return returnObj;
};

const fetchNextLocationPrimaryKeyAccessor = async () => {
    let returnObj;
    returnObj = await containerQueries.fetchNextLocationPrimaryKeyQuery();
    return returnObj;
};

const fetchNextDeviceAttributesPrimaryKeyAccessor = async () => {
    let returnObj;
    returnObj = await containerQueries.fetchNextDeviceAttributesPrimaryKeyQuery();
    return returnObj;
};

const updateElocksLocationDeviceAttributeMasterAccessor = async (req) => {
    let returnObj;
    returnObj = await containerQueries.updateElocksLocationDeviceAttributeMasterQuery(req);
    return returnObj;
};

const updateNextDeviceAttributesPrimaryKeyAccessor = async (req) => {
    let returnObj;
    returnObj = await containerQueries.updateNextDeviceAttributesPrimaryKeyQuery(req);
    return returnObj;
};
const updateNextLocationPrimaryKeyAccessor = async (req) => {
    let returnObj;
    returnObj = await containerQueries.updateNextLocationPrimaryKeyQuery(req);
    return returnObj;
};

const getMasterDumpDateAccessor = async () => {
    let returnObj;
    returnObj = await containerQueries.getMasterDumpDateQuery();
    return returnObj;
};

const updateMasterDumpDateAccessor = async (field, data) => {
    let returnObj;
    returnObj = await containerQueries.updateMasterDumpDateQuery(field, data);
    return returnObj;
};

const insertElocksDumpDataAccessor = async (req) => {
    let returnObj;
    returnObj = await containerQueries.insertElocksDumpDataQuery(req);
    return returnObj;
};

const getSortedDumpDataAccessor = async () => {
    let returnObj;
    returnObj = await containerQueries.getSortedDumpDataQuery();
    return returnObj;
};

const deleteSortedDumpDataAccessor = async (req) => {
    let returnObj;
    returnObj = await containerQueries.deleteSortedDumpDataQuery(req);
    return returnObj;
};


/*
const listContainersAccessor = async (req) => {
    let returnObj, modifiedQuery, finalQuery, request = [], extraQuery = ``;
    modifiedQuery = requestInModifier(req.userIdList, containerQueries.listContainersQuery, false);
    if (req.nativeUserRole === COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_OPERATOR) {
        request = [...req.userIdList, req.centerId];
        extraQuery = `and center_id = $${req.userIdList.length + 1}`;
    } else {
        request = [...req.userIdList];
    }
    console.log(modifiedQuery);
    finalQuery = `${modifiedQuery} ${extraQuery} ${sortWithPaginationQueryCreator(req.sortBy, 'desc', parseInt(req.skip, 10), parseInt(req.limit, 10), TABLE_CONTAINER)}`;
    console.log(finalQuery);
    console.log(req.userIdList);
    returnObj = await connectionCheckAndQueryExec(request, finalQuery);
    return returnObj;
};
*/

const getContainerMasterPasswordAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, containerQueries.getContainerMasterPasswordQuery);
    return returnObj;
};

const fetchAndUpdateContainerPasswordCounterAccessor = async (req) => {
    let returnObj;
    returnObj = await containerQueries.fetchAndUpdateContainerPasswordCounterQuery(req);
    return returnObj;
};

const getActivePasswordForContainerIdAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, containerQueries.getActivePasswordForContainerIdQuery);
    return returnObj;
};

const setContainerLockStatusAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, containerQueries.setContainerLockStatusQuery);
    console.log(returnObj);
    return returnObj;
};


const listContainersAccessor = async (req) => {
    let returnObj, modifiedQuery, finalQuery, request = [], extraQuery = ``;
    modifiedQuery = requestInModifier(req.userIdList, containerQueries.listContainersQuery, true);
    if (req.nativeUserRole === COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_OPERATOR) {
        request = [req.languageId, ...req.userIdList, req.centerId];
        extraQuery = `and center_id = $${req.userIdList.length + 2}`;
    } else if (req.nativeUserRole === COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_CLIENT) {
        request = [req.languageId, ...req.userIdList, req.companyId];
        extraQuery = ` and company_id = $${req.userIdList.length + 2}`;
    } else {
        request = [req.languageId, ...req.userIdList];
    }
    // console.log(modifiedQuery);
    finalQuery = `${modifiedQuery} ${extraQuery} ${sortWithPaginationQueryCreator(req.sortBy, 'desc', parseInt(req.skip, 10), parseInt(req.limit, 10), TABLE_CONTAINER)}`;
    console.log('final query');
    console.log(finalQuery);
    console.log(request);
    returnObj = await connectionCheckAndQueryExec(request, finalQuery);
    return returnObj;
};

const getContainerMasterPasswordAcessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, containerQueries.getContainerMasterPasswordQuery);
    return returnObj;
};
const getDeviceIMEIByContainerIdAccessor = async (req) => {
    let returnObj;
    returnObj = await getDeviceIMEIByContainerIDQuery(req);
    return returnObj;
};

const getContainerIdListAccessor = async (req) => {
    let returnObj, finalQuery, modifiedQuery, extraQuery = ``, request = [], filterQuery = null;
    modifiedQuery = requestInModifier(req.userIdList, containerQueries.listContainersQuery, true);
    if (objectHasPropertyCheck(req, 'keysArray') && objectHasPropertyCheck(req, 'valuesArray') && arrayNotEmptyCheck(req.keysArray) && arrayNotEmptyCheck(req.valuesArray)) {
        filterQuery = pgDataFilterQueryCreator(req.keysArray, req.valuesArray);
    }
    if (req.nativeUserRole === COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_OPERATOR) {
        request = [req.languageId, ...req.userIdList, parseInt(req.centerId, 10)];
        extraQuery = `and center_id = $${req.userIdList.length + 2}`;
    } else {
        request = [req.languageId, ...req.userIdList];
    }
    finalQuery = notNullCheck(filterQuery) ? `${modifiedQuery} ${extraQuery} and ${filterQuery} ${sortWithPaginationQueryCreator(req.sortBy, 'desc', req.offset, req.limit, TABLE_CONTAINER)}` : `${modifiedQuery} ${extraQuery} ${sortWithPaginationQueryCreator(req.sortBy, 'desc', req.offset, req.limit, TABLE_CONTAINER)}`;
    console.log(finalQuery);
    returnObj = await connectionCheckAndQueryExec(request, finalQuery);
    return returnObj;
};

const getContainerDetailsAccessor = async (req) => {
    let returnObj, modifiedQuery;
    modifiedQuery = requestInModifier(req.containerIdList, containerQueries.getContainerDetailsQuery, true);
    returnObj = await connectionCheckAndQueryExec([req.languageId, ...req.containerIdList], modifiedQuery);
    return returnObj;
};

const getContainerDetailsByContIdAccessor = async (req) => {
    let returnObj, modifiedQuery;
    modifiedQuery = requestInModifier(req.containerIdList, containerQueries.getContainerDetailsByContIdQuery, false);
    console.log(modifiedQuery);
    console.log(req.containerIdList);
    returnObj = await connectionCheckAndQueryExec(req.containerIdList, modifiedQuery);
    return returnObj;
};

// const editContainerAccessor = async (req) => {
//     let returnObj, updatedQueryCreatorResponse, fields = Object.keys(req), request = [];
//     fields.sort();
//     fields.splice(fields.indexOf('containerId'), 1);
//     updatedQueryCreatorResponse = updateQueryCreator('container', fields, 'container_id');
//     updatedQueryCreatorResponse.presentFields.forEach((f) => request.push(req[f]));
//     request.push(req.containerId);
//     returnObj = await connectionCheckAndQueryExec(request, updatedQueryCreatorResponse.query);
//     return returnObj;
// };

const getContainerIdListFilterAccessor = async (req) => {
    let returnObj, finalQuery, modifiedQuery, extraQuery = ``, request = [], filterQuery = null;
    modifiedQuery = requestInModifier(req.userIdList, containerQueries.listContainersFiltersQuery, true);
    if (objectHasPropertyCheck(req, 'companyName')) {
        filterQuery = `company_id IN (select company_id from company where company_name = '${req['companyName']}')`;
    }
    if (req.nativeUserRole === COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_OPERATOR) {
        request = [req.languageId, ...req.userIdList, parseInt(req.centerId, 10)];
        extraQuery = `and center_id = $${req.userIdList.length + 2}`;
    } else {
        request = [req.languageId, ...req.userIdList];
    }
    finalQuery = notNullCheck(filterQuery) ? `${modifiedQuery} ${extraQuery} and ${filterQuery} ${sortWithPaginationQueryCreator(req.sortBy, 'desc', req.offset, req.limit, TABLE_CONTAINER)}` : `${modifiedQuery} ${extraQuery} ${sortWithPaginationQueryCreator(req.sortBy, 'desc', req.offset, req.limit, TABLE_CONTAINER)}`;
    console.log(finalQuery);
    returnObj = await connectionCheckAndQueryExec(request, finalQuery);
    return returnObj;
};

module.exports = {
    getContainerIdListFilterAccessor,
    getContainerDetailsAccessor,
    // editContainerAccessor,
    getContainerDetailsByContIdAccessor,
    getDeviceIMEIByContainerIdAccessor,
    getContainerMasterPasswordAcessor,
    setContainerLockStatusAccessor,
    updateNextLocationPrimaryKeyAccessor,
    updateNextDeviceAttributesPrimaryKeyAccessor,
    addContainerDetailsAccessor,
    listContainersAccessor,
    updateElocksLocationDeviceAttributeMasterAccessor,
    fetchNextDeviceAttributesPrimaryKeyAccessor,
    fetchNextLocationPrimaryKeyAccessor,
    getTotalNoOfContainersAccessor,
    getContainerIdListAccessor,
    listUnAssignedContainersAccessor,
    updateContainerAccessor,
    containerLocationUpdateAccessor,
    containerDeviceAttributesUpdateAccessor,
    getContainerForDeviceIdAccessor,
    containerDeviceUpdateAccessor,
    getSortedDumpDataAccessor,
    deleteSortedDumpDataAccessor,
    insertElocksDumpDataAccessor,
    updateMasterDumpDateAccessor,
    getMasterDumpDateAccessor,
    getContainerDocumentByContainerIdAccessor,
    getContainerMapHistoryAccessor,
    getTotalNoOfContainersForMapAccessor,
    fetchAndUpdateContainerPasswordCounterAccessor,
    getActivePasswordForContainerIdAccessor
};


// fetchTripDetailsAccessor,
// updateTripStatusAccessor,
// getNotificationEmailsForTripIdAccesssor,
// fetchNextElockTripPrimaryKeyAccessor,
// insertElockTripDataAccessor,
// getContainerIdAccessor,
// getActiveTripDetailsByContainerIdAccessor,
// const getActiveTripDetailsByContainerIdAccessor = async (req) => {
//     let returnObj;
//     returnObj = await containerQueries.getActiveTripDetailsByContainerIdQuery(req);
//     return returnObj;
// };

// const getContainerIdAccessor = async (data) => {
//     let returnObj;
//     returnObj = await containerQueries.updateLocationDeviceAttributeMasterQuery(req);
//     return returnObj;
// };
//
// const containerLocationUpdateAccessor = async (data) => {
//     let returnObj;
//     returnObj = await deviceQueries.updateLocationDeviceAttributeMasterQuery(req);
//     return returnObj;
// };

// const fetchNextElockTripPrimaryKeyAccessor = async () => {
//     let returnObj;
//     returnObj = await containerQueries.fetchNextElockTripPrimaryKeyQuery();
//     return returnObj;
// };
//
//
// const insertElockTripDataAccessor = async (req) => {
//     let returnObj;
//     returnObj = await containerQueries.insertElockTripDataQuery(req);
//     return returnObj;
// };

// const fetchTripDetailsAccessor = async (req) => {
//     let returnObj;
//     returnObj = await containerQueries.fetchTripDetailsQuery(req);
//     return returnObj;
// };
// const getNotificationEmailsForTripIdAccesssor = async (req) => {
//     let returnObj;
//     returnObj = await containerQueries.getNotificationEmailsForTripIdQuery(req);
//     return returnObj;
// };
// const updateTripStatusAccessor = async (req) => {
//     let returnObj, newReq = {};
//     newReq['tripId'] = req.tripId;
//     newReq['setFields'] = getSetFields(req, 'tripId');
//     returnObj = await containerQueries.updateTripStatusQuery(newReq);
//     return returnObj;
// };
