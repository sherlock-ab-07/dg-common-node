const userQueries = require('../../repository-module/queries/user-query');
const {connectionCheckAndQueryExec} = require("../../util-module/custom-request-reponse-modifiers/response-creator");
const COMMON_CONSTANTS = require('../../util-module/util-constants/fennix-common-constants');
const {selectCenterIdsForLoggedInUserAndSubUsersQuery} = require('../../repository-module/queries/location-query');
const {requestInModifier} = require('../../util-module/request-transformers');
const {objectHasPropertyCheck, arrayNotEmptyCheck} = require('../../util-module/data-validators');


const getUserIdsForSupervisorService = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, userQueries.getUserIdsForSupervisorQuery);
    return returnObj;
};

const getUserIdsForAdminService = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, userQueries.getUserIdsForAdminQuery);
    return returnObj;
};

const getUserIdsForSuperAdminService = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, userQueries.getUserIdsForSuperAdminQuery);
    return returnObj;
};

const getUserIdsForMasterAdminService = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, userQueries.getUserIdsForMasterAdminQuery);
    return returnObj;
};

const getUserIdsForGlobalAdminService = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, userQueries.getUserIdsForGlobalAdminQuery);
    return returnObj;
};

const getUserIdsForCustomsService = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, userQueries.getUserIdsForCustomsQuery);
    return returnObj;
};

const getUserIdsForAllRolesService = async (req, dataModifier) => {
    let userDetailResponse, otherUserIdsForGivenUserId, returnObj;
    userDetailResponse = await connectionCheckAndQueryExec([req.languageId, req.userId], userQueries.getUserNameFromUserIdQuery);
    if (objectHasPropertyCheck(userDetailResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(userDetailResponse.rows)) {
        let nativeUserRole = userDetailResponse.rows[0][COMMON_CONSTANTS.FENNIX_NATIVE_ROLE];
        switch (nativeUserRole) {
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_OPERATOR: {
                otherUserIdsForGivenUserId = userDetailResponse.rows[0];
                break;
            }
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_SUPERVISOR : {
                otherUserIdsForGivenUserId = await getUserIdsForSupervisorService([req.userId, req.languageId]);
                break;
            }
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_ELOCKS_OPERATOR:
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_ADMIN : {
                otherUserIdsForGivenUserId = await getUserIdsForAdminService([req.userId, req.languageId]);
                break;
            }
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_ELOCK_ADMIN:
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_SUPER_ADMIN : {
                otherUserIdsForGivenUserId = await getUserIdsForSuperAdminService([req.languageId, req.userId]);
                break;
            }
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_MASTER_ADMIN : {
                otherUserIdsForGivenUserId = await getUserIdsForMasterAdminService([req.locationId, req.languageId]);
                break;
            }
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_GLOBAL_ADMIN : {
                otherUserIdsForGivenUserId = await getUserIdsForGlobalAdminService([req.languageId]);
                break;
            }
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_CUSTOMS: {
                otherUserIdsForGivenUserId = await getUserIdsForCustomsService([req.languageId]);
                break;
            }
            case COMMON_CONSTANTS.FENNIX_NATIVE_ROLE_CLIENT: {
                otherUserIdsForGivenUserId = userDetailResponse;
                break;
            }
        }
        if (objectHasPropertyCheck(otherUserIdsForGivenUserId, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(otherUserIdsForGivenUserId.rows)) {
            switch (dataModifier.toLowerCase()) {
                case COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID_NAME.toLowerCase():
                    returnObj = [];
                    otherUserIdsForGivenUserId.rows.forEach(item => {
                        let obj = {
                            userId: item['user_id'],
                            name: item['full_name']
                        };
                        returnObj.push(obj);
                    });
                    break;
                case COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID.toLowerCase():
                    returnObj = [];
                    otherUserIdsForGivenUserId.rows.forEach(item => {
                        returnObj.push(item['user_id']);
                    });
                    break;
                case COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_ALL.toLowerCase():
                    returnObj = otherUserIdsForGivenUserId;
                    break;
                case COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_ALL_NATIVE_USER_ROLE.toLowerCase():
                    returnObj = {
                        userDetails: otherUserIdsForGivenUserId,
                        nativeUserRole: nativeUserRole
                    };
                    break;
                case COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID_NATIVE_ROLE.toLowerCase():
                    let userIds = [];
                    otherUserIdsForGivenUserId.rows.forEach(item => {
                        userIds.push(item['user_id']);
                    });
                    returnObj = {
                        userIdsList: userIds,
                        nativeUserRole: nativeUserRole
                    }
            }
        }
    }
    return returnObj;
};

const getCenterIdsForLoggedInUserAndSubUsersService = async (req) => {
    let returnObj, modifiedQuery;
    modifiedQuery = requestInModifier(req, selectCenterIdsForLoggedInUserAndSubUsersQuery, false);
    returnObj = await connectionCheckAndQueryExec(req, modifiedQuery);
    return returnObj;
};

module.exports = {
    getUserIdsForAllRolesService,
    getCenterIdsForLoggedInUserAndSubUsersService
};
