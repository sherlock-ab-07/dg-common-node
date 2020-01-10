const {objectHasPropertyCheck, arrayNotEmptyCheck} = require("../../util-module/data-validators");
const {filterQueryCreator} = require('../../util-module/request-transformers');
const {connectionCheckAndQueryExec} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const COMMON_CONSTANTS = require('../../util-module/util-constants/fennix-common-constants');
const metadataQueries = require('../queries/metadata-query');
const locationQueries = require('../queries/location-query');
const {selectCenterIdsForGivenUserIdQuery} = require('../queries/location-query');
const languageQueries = require('../queries/language-query');

const {getUserNameFromUserIdAccessor} = require('../data-accesors/user-accesor');

const getCardMetadataAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, metadataQueries.cardWidgetMetadataQuery);
    return returnObj;
};
const getSideNavMetadataAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, metadataQueries.sideNavMetadataQuery);
    return returnObj;
};
const getRolesForRoleIdAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, metadataQueries.getRolesForRoleIdQuery);
    return returnObj;
};

const getHeaderMetadataAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, metadataQueries.headerMetadataQuery);
    return returnObj;
};

const getCenterIdsBasedOnUserIdAccessor = async (req) => {
    let centerIdResponse;
    centerIdResponse = await connectionCheckAndQueryExec(req, selectCenterIdsForGivenUserIdQuery);
    return centerIdResponse;
};

const getFilterMetadataAccessor = async (req, colName) => {
    let returnObj, modifiedFilterQuery;
    modifiedFilterQuery = filterQueryCreator(metadataQueries.filterMetadataQuery, colName);
    returnObj = await connectionCheckAndQueryExec(req, modifiedFilterQuery);
    return returnObj;
};

const getLanguagesAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, languageQueries.selectLanguagesQuery);
    return returnObj;
};

const getLanguagesDropdownAccessor = async () => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec([], languageQueries.selectLanguageDropdownQuery);
    return returnObj;
};

const getLoginMetadataAccessor = async (req) => {
    let returnObj, finalQuery;
    if (req) {
        switch (req.toLowerCase()) {
            case 'login':
                finalQuery = metadataQueries.loginMetadataQuery;
                break;
            case 'forgot_password':
                finalQuery = metadataQueries.forgotPasswordMetadataQuery;
                break;
            case 'change_password':
                finalQuery = metadataQueries.createPasswordMetadataQuery;
                break
        }
    }
    returnObj = await connectionCheckAndQueryExec([], finalQuery);
    return returnObj;
};
const getModalMetadataAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, metadataQueries.modalMetadataQuery);
    return returnObj;
};


const getRolesAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, metadataQueries.getRoleQuery);
    return returnObj;
};

const getCenterIdsAccessor = async (req) => {
    let userDetailResponse, centerIdResponse, request = [req.query.userId];
    userDetailResponse = await getUserNameFromUserIdAccessor([req.query.languageId, req.query.userId]);
    if (objectHasPropertyCheck(userDetailResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(userDetailResponse.rows)) {
        let nativeUserRole = userDetailResponse.rows[0][COMMON_CONSTANTS.FENNIX_NATIVE_ROLE];
        switch (nativeUserRole) {
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_OPERATOR : {
                centerIdResponse = await connectionCheckAndQueryExec(request, locationQueries.selectCenterIdsForOperatorQuery);
                break;
            }
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_SUPERVISOR : {
                centerIdResponse = await connectionCheckAndQueryExec(request, locationQueries.selectCenterIdsForSupervisorQuery);
                break;
            }
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_ELOCKS_OPERATOR:
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_ADMIN : {
                centerIdResponse = await connectionCheckAndQueryExec(request, locationQueries.selectCenterIdsForAdminQuery);
                break;
            }
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_ELOCK_ADMIN:    
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_SUPER_ADMIN : {
                centerIdResponse = await connectionCheckAndQueryExec(request, locationQueries.selectCenterIdsForSuperAdminQuery);
                break;
            }
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_MASTER_ADMIN : {
                centerIdResponse = await connectionCheckAndQueryExec([], locationQueries.selectAllCenterIdsForMasterAdminQuery);
                break;
            }
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_GLOBAL_ADMIN : {
                centerIdResponse = await connectionCheckAndQueryExec([], locationQueries.selectAllCenterIdsForGlobalAdminQuery);
            }
        }
    }
    return centerIdResponse;
};

const getTotalNoOfLanguagesAccessor = async () => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec([], languageQueries.getTotalNoOfLanguagesQuery);
    return returnObj;
};

module.exports = {
    getCardMetadataAccessor,
    getSideNavMetadataAccessor,
    getHeaderMetadataAccessor,
    getLoginMetadataAccessor,
    getCenterIdsBasedOnUserIdAccessor,
    getLanguagesAccessor,
    getRolesAccessor,
    getRolesForRoleIdAccessor,
    getFilterMetadataAccessor,
    getModalMetadataAccessor,
    getCenterIdsAccessor,
    getLanguagesDropdownAccessor,
    getTotalNoOfLanguagesAccessor
};

