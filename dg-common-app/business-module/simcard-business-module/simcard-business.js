const simCardAccessor = require('../../repository-module/data-accesors/sim-card-accessor');
const {fennixResponse, dropdownCreator} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const {statusCodeConstants} = require('../../util-module/response-status-constants/status-code-constants');
const {arrayNotEmptyCheck, objectHasPropertyCheck, notNullCheck} = require('../../util-module/data-validators');
const {getUserIdsForAllRolesAccessor} = require('../../repository-module/data-accesors/user-accesor');
const {getCenterIdsForLoggedInUserAndSubUsersAccessor} = require('../../repository-module/data-accesors/location-accesor');
const {mongoWhereInCreator, mongoUpdateQueryCreator} = require('../../util-module/request-transformers');
const {getCenterIdsBasedOnUserIdAccessor} = require('../../repository-module/data-accesors/metadata-accesor');
const COMMON_CONSTANTS = require('../../util-module/util-constants/fennix-common-constants');
const {getUserIdsForAllRolesService, getCenterIdsForLoggedInUserAndSubUsersService} = require('../role-business-module/role-business');
// const listUnAssignedSimcardsBusiness = async (req) => {
//     let response, request = {centerId: parseInt(req.query.centerId)}, finalResponse, modifiedResponse = [];
//     response = await simCardAccessor.listUnAssignedSimcardsAccessor(request);
//     if (arrayNotEmptyCheck(response)) {
//         response.forEach((item) => {
//             let obj = {
//                 id: item['_id'],
//                 phoneNo: item['phoneNo'],
//                 serialNo: notNullCheck(item['serial']) ? item['serial'] : 'Serial Not Assigned',
//                 isActive: item['active'],
//                 carrier: objectHasPropertyCheck(item['carrier'], 'name') ? item['carrier']['name'] : '-',
//                 simcardId: item['_id'],
//                 simcardType: objectHasPropertyCheck(item['simcardTypes'], 'simcardType') ? item['simcardTypes']['simcardType'] : '-'
//             };
//             modifiedResponse.push(obj);
//         });
//         finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
//     } else {
//         finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_SIMCARDS_FOR_ID, 'EN_US', []);
//     }
//     return finalResponse;
// };
const listUnAssignedSimcardsBusiness = async (req) => {
    let response, request = {centerId: parseInt(req.query.centerId)}, finalResponse, modifiedResponse = [];
    let userIdsResponse = await getUserIdsForAllRolesService({languageId: req.query.languageId, userId: req.query.userId}, COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID_NATIVE_ROLE);
    let centerIdsResponse = await getCenterIdsForLoggedInUserAndSubUsersService(userIdsResponse.userIdsList);
    console.log(userIdsResponse);
    if (objectHasPropertyCheck(centerIdsResponse, 'rows') && arrayNotEmptyCheck(centerIdsResponse.rows)) {
        console.log(centerIdsResponse);
        let centerIds = [];
        centerIdsResponse.rows.forEach(item => {
            if (null != item['center_id']) {
                centerIds.push(parseInt(item['center_id']));
            }
        });
        response = await simCardAccessor.listUnAssignedSimcardsAccessor({centerId: centerIds});
        if (arrayNotEmptyCheck(response)) {
            response.forEach((item) => {
                let obj = {
                    id: item['_id'],
                    phoneNo: item['phoneNo'],
                    serialNo: notNullCheck(item['serial']) ? item['serial'] : 'Serial Not Assigned',
                    isActive: item['active'],
                    carrier: objectHasPropertyCheck(item['carrier'], 'name') ? item['carrier']['name'] : '-',
                    simcardId: item['_id'],
                    simcardType: objectHasPropertyCheck(item['simcardTypes'], 'simcardType') ? item['simcardTypes']['simcardType'] : '-'
                };
                modifiedResponse.push(obj);
            });
            finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
        } else {
            finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_SIMCARDS_FOR_ID, 'EN_US', []);
        }
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_CENTERS_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};

const getSimCardDetailsBusiness = async (req) => {
    var request = [req.query.userId], centerIds, mongoRequest, response;
    centerIds = await getCenterIdsBasedOnUserIdAccessor(request);
    if (objectHasPropertyCheck(centerIds, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(centerIds.rows)) {
        let centerIdsReq = [];
        centerIds.rows.forEach(item => {
            centerIdsReq.push(`${item['location_id']}`);
        });
        mongoRequest = {centerId: mongoWhereInCreator(centerIdsReq)};
        response = await simCardAccessor.getSimcardDetailsAccessor(mongoRequest);
    }
    return response;
};


//TODO change response type login
const listSimcardTypesBusiness = async () => {
    let response, finalResponse, simcardTypeResponse = {dropdownList: []};
    response = await simCardAccessor.listSimcardTypesAccessor();
    if (arrayNotEmptyCheck(response)) {
        response.forEach((item) => {
            simcardTypeResponse.dropdownList.push(dropdownCreator(item['_id'], item['simcardType'], false));
        });
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', simcardTypeResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_SIMCARD_TYPES_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};

const addSimcardBusiness = async (req) => {
    let request, primaryKeyResponse, finalResponse, simcardResponse;
    primaryKeyResponse = await simCardAccessor.fetchNextPrimaryKeyAccessor();
    request = {
        _id: parseInt(primaryKeyResponse['_doc']['counter']),
        centerId: req.body.centerId,
        carrierByCountryId: req.body.carrierByCountryId,
        phoneNo: req.body.phoneNo,
        simCardType: req.body.simCardType,
        active: req.body.isActive,
        serial: req.body.serialNo
    };
    simcardResponse = simCardAccessor.addSimcardAccessor(request);
    // await simCardAccessor.insertNextPrimaryKeyAccessor(primaryKeyResponse[0]['_doc']['_id']);
    if (simcardResponse) {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_SIM_CARD_ADD_SUCCESS, 'EN_US', simcardResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_SIMCARDS_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};

// const getSimCardListBusiness = async (req) => {
//     let response, centerIdResponse, centerIdsReq = [], finalResponse,
//         modifiedResponse = {gridData: []}, cardIdNameMap = {}, userIdList;
//     userIdList = await getUserIdsForAllRolesAccessor(req, COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID);
//     centerIdResponse = await getCenterIdsForLoggedInUserAndSubUsersAccessor(userIdList);
//     if (objectHasPropertyCheck(centerIdResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(centerIdResponse.rows)) {
//         centerIdResponse.rows.forEach(item => {
//             centerIdsReq.push(item['center_id']);
//             cardIdNameMap[item['center_id']] = item['center_name'];
//         });
//         response = await simCardAccessor.getSimcardDetailsAccessor(centerIdsReq);
//     }
//
//     if (arrayNotEmptyCheck(response)) {
//         response.forEach((item) => {
//             let simCardObj = {
//                 simCardId: item['_id'],
//                 deviceId: item['deviceId'],
//                 simType: item['simCardType'],
//                 mobileNo: item['phoneNo'],
//                 serialNumber: item['serialNp'],
//                 apn: item['carrierByCountryDetails']['apn'],
//                 carrierName: item['carrier']['name'],
//                 center: cardIdNameMap[item['centerId']]
//             };
//             modifiedResponse.gridData.push(simCardObj);
//         });
//
//         finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
//     } else {
//         finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_SIMCARDS_FOR_ID, 'EN_US', []);
//     }
//     return finalResponse;
// };

const getElockSimCardListBusiness = async (req) => {
    let response, centerIdResponse, centerIdsReq = [], finalResponse, request = {},
        modifiedResponse = {gridData: []}, cardIdNameMap = {}, userIdList, totalNoOfSimcards;
    userIdList = await getUserIdsForAllRolesAccessor(req, COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID);
    centerIdResponse = await getCenterIdsForLoggedInUserAndSubUsersAccessor(userIdList);
    if (objectHasPropertyCheck(centerIdResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(centerIdResponse.rows)) {
        centerIdResponse.rows.forEach(item => {
            centerIdsReq.push(item['center_id']);
            cardIdNameMap[item['center_id']] = item['center_name'];
        });
        totalNoOfSimcards = await simCardAccessor.getTotalNoOfElockSimcardsAccessor(centerIdsReq);
        request = {centerIdList: centerIdsReq, skip: parseInt(req.query.skip), limit: parseInt(req.query.limit)};
        response = await simCardAccessor.getElockSimcardDetailsAccessor(request);
    }

    if (arrayNotEmptyCheck(response)) {
        response.forEach((item) => {
            let simCardObj = {
                simCardId: item['_id'],
                deviceId: item['deviceId'],
                simType: objectHasPropertyCheck(item['simCardTypes'], 'simcardType') ? item['simCardTypes']['simcardType'] : '-',
                mobileNo: item['phoneNo'],
                serialNumber: item['serial'],
                apn: objectHasPropertyCheck(item['carrierByCountryDetails'], 'apn') ? item['carrierByCountryDetails']['apn'] : '-',
                carrierName: objectHasPropertyCheck(item['carrier'], 'name') ? item['carrier']['name'] : '-',
                center: cardIdNameMap[item['centerId']]
            };
            modifiedResponse.gridData.push(simCardObj);
        });
        modifiedResponse.totalNoOfRecords = totalNoOfSimcards[0]['total'];
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_SIMCARDS_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};

const getSimCardListBusiness = async (req) => {
    let response, centerIdResponse, centerIdsReq = [], finalResponse, request = {},
        modifiedResponse = {gridData: []}, cardIdNameMap = {}, userIdList, totalNoOfSimcards;
    userIdList = await getUserIdsForAllRolesAccessor(req, COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID);
    centerIdResponse = await getCenterIdsForLoggedInUserAndSubUsersAccessor(userIdList);
    if (objectHasPropertyCheck(centerIdResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(centerIdResponse.rows)) {
        centerIdResponse.rows.forEach(item => {
            centerIdsReq.push(item['center_id']);
            cardIdNameMap[item['center_id']] = item['center_name'];
        });
        totalNoOfSimcards = await simCardAccessor.getTotalNoOfSimcardsAccessor(centerIdsReq);
        request = {centerIds: centerIdsReq, skip: parseInt(req.query.skip), limit: parseInt(req.query.limit)};
        response = await simCardAccessor.getSimcardDetailsAccessor(request);
    }

    if (arrayNotEmptyCheck(response)) {
        response.forEach((item) => {
            if (item) {
                let simCardObj = {
                    simCardId: item['_id'],
                    deviceId: item['deviceId'],
                    simType: item && item['simCardTypes'] ? item['simCardTypes']['simcardType'] : '-',
                    mobileNo: item['phoneNo'],
                    serialNumber: item['serial'],
                    apn: item && item['carrierByCountryDetails'] ? item['carrierByCountryDetails']['apn'] : '-',
                    carrierName: item['carrier']['name'],
                    center: cardIdNameMap[item['centerId']]
                };
                modifiedResponse.gridData.push(simCardObj);
            }
        });
        modifiedResponse.totalNoOfRecords = totalNoOfSimcards['total'];
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_SIMCARDS_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};

const editSimcardBusiness = async (req) => {
    let simCardId = parseInt(req.body.simCardId), mainReq = req.body, response, finalResponse, mongoReq;
    delete mainReq.simCardId;
    mongoReq = mongoUpdateQueryCreator(mainReq);
    response = simCardAccessor.editSimcardAcessor(simCardId, mongoReq);
    if (notNullCheck(response)) {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', 'Updated simcard successfully');
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_DEVICES_FOR_ID, 'EN_US', 'Error while updating simcard details');
    }
    return finalResponse;
};

const deleteSimcardBusiness = async (req) => {
    let simCardId = parseInt(req.body.simCardId), request = {active: false}, response, finalResponse, mongoReq;
    mongoReq = mongoUpdateQueryCreator(request);
    response = simCardAccessor.editSimcardAcessor(simCardId, mongoReq);
    if (notNullCheck(response)) {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', 'Updated simcard successfully');
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_SIMCARDS_FOR_ID, 'EN_US', 'Error while updating simcard details');
    }
    return finalResponse;
};

module.exports = {
    deleteSimcardBusiness,
    editSimcardBusiness,
    listUnAssignedSimcardsBusiness,
    listSimcardTypesBusiness,
    addSimcardBusiness,
    getSimCardListBusiness,
    getElockSimCardListBusiness,
    getSimCardDetailsBusiness
};
