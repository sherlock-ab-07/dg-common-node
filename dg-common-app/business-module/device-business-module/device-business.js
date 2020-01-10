const deviceAccessor = require('../../repository-module/data-accesors/device-accesor');
const {mongoUpdateQueryCreator} = require('../../util-module/request-transformers');
const {addDeviceIdForSimcardAccessor} = require('../../repository-module/data-accesors/sim-card-accessor');
const {notNullCheck, objectHasPropertyCheck, deviceStatusMapper, arrayNotEmptyCheck} = require('../../util-module/data-validators');
const {getBeneficiaryByUserIdAccessor, getBeneficiaryNameFromBeneficiaryIdAccessor} = require('../../repository-module/data-accesors/beneficiary-accesor');
const userAccessor = require('../../repository-module/data-accesors/user-accesor');
const beneficiaryAccessor = require('../../repository-module/data-accesors/beneficiary-accesor');
const {fennixResponse, dropdownCreator} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const centerMetadataAccessors = require('../../repository-module/data-accesors/metadata-accesor');
const containerAccessor = require('../../repository-module/data-accesors/container-accessor');
const {statusCodeConstants} = require('../../util-module/response-status-constants/status-code-constants');
const {getCenterIdsForLoggedInUserAndSubUsersAccessor} = require('../../repository-module/data-accesors/location-accesor');
const COMMON_CONSTANTS = require('../../util-module/util-constants/fennix-common-constants');
const tripAccessors = require('../../repository-module/data-accesors/trip-accessor');

const deviceAggregatorDashboard = async (req) => {
    let beneficiaryResponse, deviceResponse, returnObj, userIdList;
    userIdList = await userAccessor.getUserIdsForAllRolesAccessor(req, COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID);
    beneficiaryResponse = await getBeneficiaryByUserIdAccessor(userIdList);
    if (objectHasPropertyCheck(beneficiaryResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(beneficiaryResponse.rows)) {
        let deviceArray = [];
        beneficiaryResponse.rows.forEach((item) => {
            deviceArray.push(item.beneficiaryid);
        });
        deviceResponse = await deviceAccessor.deviceAggregator(deviceArray);
    }
    if (notNullCheck(deviceResponse) && arrayNotEmptyCheck(deviceResponse)) {
        let deviceObj = {
            ACTIVE: {key: 'activeDevices', value: '', color: '', legend: 'ACTIVE'},
            INACTIVE: {key: 'inActiveDevices', value: '', color: '', legend: 'INACTIVE'}
        };
        if (deviceResponse.length === 1) {
            let propertyName = deviceResponse[0]['_id'] ? 'ACTIVE' : 'INACTIVE';
            let propertyName2 = propertyName === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            deviceObj[propertyName]['value'] = deviceResponse[0]['count'];
            deviceObj[propertyName2]['value'] = 0;
        } else {
            deviceResponse.forEach((item) => {
                let prop = item['_id'] ? 'ACTIVE' : 'INACTIVE';
                deviceObj[prop]['value'] = item['count'];
            });
        }
        returnObj = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', deviceObj);
    } else {
        returnObj = fennixResponse(statusCodeConstants.STATUS_USER_RETIRED, 'EN_US', []);
    }
    return returnObj;
};

//TODO: change response logic
const listDeviceTypesBusiness = async () => {
    let deviceTypesResponse, finalResponse, deviceTypesListResponse = {dropdownList: []};
    deviceTypesResponse = await deviceAccessor.listDeviceTypesAccessor();
    if (arrayNotEmptyCheck(deviceTypesResponse)) {
        deviceTypesResponse.forEach((item) => {
            deviceTypesListResponse.dropdownList.push(dropdownCreator(item['_id'], item['name'], false));
        });
    }
    finalResponse = arrayNotEmptyCheck(deviceTypesResponse) ? fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', deviceTypesListResponse) : fennixResponse(statusCodeConstants.STATUS_NO_DEVICE_TYPES_FOR_ID, 'EN_US', deviceTypesListResponse);
    return finalResponse;
};

const listElockDevicesBusiness = async (req) => {
    let userIdList, centerIdResponse, centerIdsReq = [], centerIdNameMap = {},
        containerIdNameMap = {}, devicesResponse, containerNameResponse, containerIds = [], totalNoOfRecords,
        modifiedResponse = {gridData: []}, finalResponse, request = {};
    userIdList = await userAccessor.getUserIdsForAllRolesAccessor(req, COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID);
    // console.log(userIdList);
    centerIdResponse = await getCenterIdsForLoggedInUserAndSubUsersAccessor(userIdList);
    // console.log(centerIdResponse);
    if (objectHasPropertyCheck(centerIdResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(centerIdResponse.rows)) {
        centerIdResponse.rows.forEach(item => {
            centerIdsReq.push(item['center_id']);
            centerIdNameMap[item['center_id']] = item['center_name'];
        });
        // console.log(centerIdsReq);
        request = {centerIds: centerIdsReq, skip: parseInt(req.query.skip), limit: parseInt(req.query.limit)};
        totalNoOfRecords = await deviceAccessor.getTotalNoOfElockDevicesAccessor(centerIdsReq);
        // console.log(totalNoOfRecords);
        devicesResponse = await deviceAccessor.listElockDevicesAccessor(request);
    }

    if (arrayNotEmptyCheck(devicesResponse)) {
        devicesResponse.forEach((item) => {
            if (objectHasPropertyCheck(item, 'containerId')) {
                containerIds.push(`${item['containerId']}`);
            }
        });
        containerNameResponse = await containerAccessor.getContainerDetailsAccessor({
            containerIdList: containerIds,
            languageId: req.query.languageId
        });
        // console.log(containerNameResponse);
        if (objectHasPropertyCheck(containerNameResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(containerNameResponse.rows)) {
            containerNameResponse.rows.forEach((item) => {
                let obj = {
                    containerType: item['container_type_value'],
                    containerName: item['container_name']
                };
                containerIdNameMap[item['container_id']] = obj;
            });
        }
        devicesResponse.forEach((item) => {
            deviceObj = {
                deviceId: item['_id'],
                deviceType: item['deviceTypes']['name'],
                imei: item['imei'],
                isActive: item['active'],
                mobileNo: item['simcards']['phoneNo'],
                center: centerIdNameMap[item['centerId']],
                containerType: objectHasPropertyCheck(containerIdNameMap[item['containerId']], 'containerType') ? containerIdNameMap[item['containerId']]['containerType'] : '-',
                containerName: objectHasPropertyCheck(containerIdNameMap[item['containerId']], 'containerName') ? containerIdNameMap[item['containerId']]['containerName'] : '-'
            };
            modifiedResponse.gridData.push(deviceObj);
        });
        modifiedResponse.totalNoOfRecords = totalNoOfRecords;
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_DEVICES_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};

const listDevicesBusiness = async (req) => {
    let userIdList, centerIdResponse, centerIdsReq = [], centerIdNameMap = {},
        beneficiaryIdNameMap = {}, devicesResponse, beneficiaryNameResponse, beneficiaryIds = [], totalNoOfRecords,
        modifiedResponse = {gridData: []}, finalResponse, request = {};
    userIdList = await userAccessor.getUserIdsForAllRolesAccessor(req, COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID);
    centerIdResponse = await getCenterIdsForLoggedInUserAndSubUsersAccessor(userIdList);
    if (objectHasPropertyCheck(centerIdResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(centerIdResponse.rows)) {
        centerIdResponse.rows.forEach(item => {
            centerIdsReq.push(item['center_id']);
            centerIdNameMap[item['center_id']] = item['center_name'];
        });
        request = {centerIds: centerIdsReq, skip: parseInt(req.query.skip), limit: parseInt(req.query.limit)};
        totalNoOfRecords = await deviceAccessor.getTotalNoOfDevicesAccessor(centerIdsReq);
        devicesResponse = await deviceAccessor.listDevicesAccessor(request);
    }

    if (arrayNotEmptyCheck(devicesResponse)) {
        devicesResponse.forEach((item) => {
            if (objectHasPropertyCheck(item, 'beneficiaryId')) {
                beneficiaryIds.push(`${item['beneficiaryId']}`);
            }
        });
        beneficiaryNameResponse = await getBeneficiaryNameFromBeneficiaryIdAccessor(beneficiaryIds, req.query.languageId);
        if (objectHasPropertyCheck(beneficiaryNameResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(beneficiaryNameResponse.rows)) {
            beneficiaryNameResponse.rows.forEach((item) => {
                let beneficiaryObj = {
                    fullName: item['full_name'],
                    roleName: item['role_name'],
                    roleId: item['beneficiary_role']
                };
                beneficiaryIdNameMap[item['beneficiaryid']] = beneficiaryObj;
            });
        }
        devicesResponse.forEach((item) => {
            deviceObj = {
                deviceId: item['_id'],
                deviceType: item['deviceTypes']['name'],
                imei: item['imei'],
                isActive: item['active'],
                mobileNo: item['simcards']['phoneNo'],
                center: centerIdNameMap[item['centerId']],
                beneficiaryName: objectHasPropertyCheck(beneficiaryIdNameMap[item['beneficiaryId']], 'fullName') ? beneficiaryIdNameMap[item['beneficiaryId']]['fullName'] : '-',
                beneficiaryRole: objectHasPropertyCheck(beneficiaryIdNameMap[item['beneficiaryId']], 'roleName') ? beneficiaryIdNameMap[item['beneficiaryId']]['roleName'] : '-',
                beneficiaryRoleId: objectHasPropertyCheck(beneficiaryIdNameMap[item['beneficiaryId']], 'roleId') ? beneficiaryIdNameMap[item['beneficiaryId']]['roleId'] : '-'
            };
            modifiedResponse.gridData.push(deviceObj);
        });
        modifiedResponse.totalNoOfRecords = totalNoOfRecords;
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_DEVICES_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};

// const getBeneficiaryMapHistoryAccessor = async (req) => {
//     let returnObj;
//     returnObj = await getBeneficiaryMapHistoryQuery(req);
//     return returnObj;
// };

// const listDevicesBusiness = async (req) => {
//     let userIdList, centerIdResponse, centerIdsReq = [], centerIdNameMap = {},
//         beneficiaryIdNameMap = {}, devicesResponse, beneficiaryNameResponse, beneficiaryIds = [],
//         modifiedResponse = {gridData: []}, finalResponse;
//     userIdList = await userAccessor.getUserIdsForAllRolesAccessor(req, COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID);
//     centerIdResponse = await getCenterIdsForLoggedInUserAndSubUsersAccessor(userIdList);
//     if (objectHasPropertyCheck(centerIdResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(centerIdResponse.rows)) {
//         centerIdResponse.rows.forEach(item => {
//             centerIdsReq.push(item['center_id']);
//             centerIdNameMap[item['center_id']] = item['center_name'];
//         });
//         devicesResponse = await deviceAccessor.listDevicesAccessor(centerIdsReq);
//     }
//
//     if (arrayNotEmptyCheck(devicesResponse)) {
//         devicesResponse.forEach((item) => {
//             if (objectHasPropertyCheck(item, 'beneficiaryId')) {
//                 beneficiaryIds.push(`${item['beneficiaryId']}`);
//             }
//         });
//         beneficiaryNameResponse = await getBeneficiaryNameFromBeneficiaryIdAccessor(beneficiaryIds, req.query.languageId);
//         if (objectHasPropertyCheck(beneficiaryNameResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(beneficiaryNameResponse.rows)) {
//             beneficiaryNameResponse.rows.forEach((item) => {
//                 let beneficiaryObj = {
//                     fullName: item['full_name'],
//                     roleName: item['role_name'],
//                     roleId: item['beneficiary_role']
//                 };
//                 beneficiaryIdNameMap[item['beneficiaryid']] = beneficiaryObj;
//             });
//         }
//         devicesResponse.forEach((item) => {
//             deviceObj = {
//                 deviceId: item['_id'],
//                 deviceType: item['deviceTypes']['name'],
//                 imei: item['imei'],
//                 isActive: item['active'],
//                 mobileNo: item['simcards']['phoneNo'],
//                 center: centerIdNameMap[item['centerId']],
//                 beneficiaryName: objectHasPropertyCheck(beneficiaryIdNameMap[item['beneficiaryId']], 'fullName') ? beneficiaryIdNameMap[item['beneficiaryId']]['fullName'] : '-',
//                 beneficiaryRole: objectHasPropertyCheck(beneficiaryIdNameMap[item['beneficiaryId']], 'roleName') ? beneficiaryIdNameMap[item['beneficiaryId']]['roleName'] : '-',
//                 beneficiaryRoleId: objectHasPropertyCheck(beneficiaryIdNameMap[item['beneficiaryId']], 'roleId') ? beneficiaryIdNameMap[item['beneficiaryId']]['roleId'] : '-'
//             };
//             modifiedResponse.gridData.push(deviceObj);
//         });
//         finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
//     } else {
//         finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_DEVICES_FOR_ID, 'EN_US', []);
//     }
//     return finalResponse;
// };

//
// const listDevicesBusiness = async (req) => {
//     let centerIdResponse, centerIdsReq = [], centerIdNameMap = {},
//         beneficiaryIdNameMap = {}, devicesResponse, beneficiaryNameResponse, beneficiaryIds = [],
//         modifiedResponse = {gridData: []}, finalResponse;
//     centerIdResponse = await centerMetadataAccessors.getCenterIdsAccessor(req);
//     if (objectHasPropertyCheck(centerIdResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(centerIdResponse.rows)) {
//         centerIdResponse.rows.forEach(item => {
//             centerIdsReq.push(item['location_id']);
//             centerIdNameMap[item['location_id']] = item['location_name'];
//         });
//         devicesResponse = await listDevicesAccessor(centerIdsReq);
//     }
//
//     if (arrayNotEmptyCheck(devicesResponse)) {
//         devicesResponse.forEach((item) => {
//             beneficiaryIds.push(item['beneficiaryId']);
//         });
//         beneficiaryNameResponse = await getBeneficiaryNameFromBeneficiaryIdAccessor(beneficiaryIds, req.query.languageId);
//         if (objectHasPropertyCheck(beneficiaryNameResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(beneficiaryNameResponse.rows)) {
//             beneficiaryNameResponse.rows.forEach((item) => {
//                 let beneficiaryObj = {
//                     fullName: item['full_name'],
//                     roleName: item['role_name'],
//                     roleId: item['beneficiary_role']
//                 };
//                 beneficiaryIdNameMap[item['beneficiaryid']] = beneficiaryObj;
//             });
//         }
//         devicesResponse.forEach((item) => {
//             deviceObj = {
//                 deviceId: item['_id'],
//                 deviceType: item['deviceTypes']['name'],
//                 imei: item['imei'],
//                 isActive: item['isActive'],
//                 mobileNo: item['simcards']['phoneNo'],
//                 center: centerIdNameMap[item['centerId']],
//                 beneficiaryName: objectHasPropertyCheck(beneficiaryIdNameMap[item['beneficiaryId']], 'fullName') ? beneficiaryIdNameMap[item['beneficiaryId']]['fullName'] : '-',
//                 beneficiaryRole: objectHasPropertyCheck(beneficiaryIdNameMap[item['beneficiaryId']], 'roleName') ? beneficiaryIdNameMap[item['beneficiaryId']]['roleName'] : '-',
//                 beneficiaryRoleId: objectHasPropertyCheck(beneficiaryIdNameMap[item['beneficiaryId']], 'roleId') ? beneficiaryIdNameMap[item['beneficiaryId']]['roleId'] : '-'
//             };
//             modifiedResponse.gridData.push(deviceObj);
//         });
//         finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
//     } else {
//         finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_DEVICES_FOR_ID, 'EN_US', []);
//     }
//     return finalResponse;
// };

const insertDeviceBusiness = async (req) => {
    let primaryKeyResponse, counter;
    primaryKeyResponse = await deviceAccessor.fetchNextPrimaryKeyAccessor();
    if (objectHasPropertyCheck(primaryKeyResponse, '_doc')) {
        counter = parseInt(primaryKeyResponse['_doc']['counter']);
        let obj = {
            _id: counter,
            imei: req.body.imei,
            centerId: req.body.centerId,
            simCardId: req.body.simCardId,
            deviceTypeId: req.body.deviceTypeId,
            active: req.body.isActive,
            createdDate: new Date()
        };
        await deviceAccessor.insertDeviceAccessor(obj);
        const request = {simCardId: req.body.simCardId, deviceId: counter};
        addDeviceIdForSimcardAccessor(request);
        return fennixResponse(statusCodeConstants.STATUS_DEVICE_ADD_SUCCESS, 'EN_US', 'Device added');
        // await deviceAccessor.insertNextPrimaryKeyAccessor(primaryKeyResponse[0]['_doc']['_id']);
    }
};

const getDeviceByDeviceIdBusiness = async (req) => {
    const request = {deviceId: req.query.deviceId};
    let deviceResponse, returnObj;
    deviceResponse = await deviceAccessor.getDeviceByDeviceIdAccessor(request);
    if (notNullCheck(deviceResponse)) {
        returnObj = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', deviceResponse);
    } else {
        returnObj = fennixResponse(statusCodeConstants.STATUS_NO_DEVICES_FOR_ID, 'EN_US', []);
    }
    return returnObj;
};

/**@description : This method provides the complete data for the device by beneficiaryId.
 * It first gets the latest device attributes by fetching the device details from device attributes table using the deviceId from the deviceLocationMaster.
 * along with the device attributes it gets the device details from the device table also
 // * @param req.query : beneficiaryId
 * @returns complete device details
 */
const getDeviceDetailsByBeneficiaryIdBusiness = async (req) => {
    const request = {beneficiaryId: parseInt(req.query.beneficiaryId)};
    const GPS = {A: 'Valid', V: 'Invalid'};
    let deviceResponse, returnObj, finalResponse = {};
    if (notNullCheck(request.beneficiaryId)) {
        deviceResponse = await deviceAccessor.getDeviceByBeneficiaryIdAccessor(request);
    }
    if (notNullCheck(deviceResponse)) {
        finalResponse['beneficiaryId'] = deviceResponse[0]['beneficiaryId'];
        const deviceAttributes = {...deviceResponse[0].deviceAttributes};
        let newDeviceAttributes = {};
        Object.keys(deviceAttributes).forEach((key) => {
            let obj = {};
            switch (key) {
                case 'batteryVoltage':
                    obj = {
                        value: `${deviceAttributes[key]} V`,
                        status: deviceStatusMapper('batteryVoltage', deviceAttributes[key]),
                        key
                    };
                    break;
                case 'speed':
                    obj = {
                        status: parseInt(deviceAttributes[key]) > 0 ? 'moving' : 'still',
                        value: `${Math.floor(parseInt(deviceAttributes[key]))} km/hr`,
                        key
                    };
                    break;
                case 'batteryPercentage':
                    obj = {
                        value: `${deviceAttributes[key]} %`,
                        status: deviceStatusMapper('batteryPercentage', deviceAttributes[key]),
                        key
                    };
                    break;
                case 'beltStatus':
                    obj = {
                        key,
                        status: deviceAttributes[key] === 1 ? 'violation' : 'safe',
                        value: deviceAttributes[key] === 1 ? 'Belt Cut' : 'OK'
                    };
                    break;
                case 'shellStatus':
                    obj = {
                        key,
                        status: deviceAttributes[key] === 1 ? 'violation' : 'safe',
                        value: deviceAttributes[key] === 1 ? 'Shell Break' : 'OK'
                    };
                    break;
                case 'gsmStatus':
                    obj = {
                        key,
                        status: deviceAttributes[key] < 2 ? 'violation' : 'safe',
                        value: deviceAttributes[key] < 2 ? 'Low' : 'OK'
                    };
                    break;
                case 'rfConnectionStatus':
                    obj = {
                        key,
                        status: deviceAttributes[key] ? 'violation' : 'safe',
                        value: deviceAttributes[key] ? 'Outdoor' : 'Home'
                    };
                    break;
                case 'rfPlugStatus':
                    obj = {
                        key,
                        status: deviceAttributes[key] === 0 ? 'violation' : 'safe',
                        value: deviceAttributes[key] === 0 ? 'Out' : 'In'
                    };
                    break;
                case 'gpsStatus':
                    obj = {
                        key,
                        status: deviceAttributes[key] === 'V' ? 'violation' : 'safe',
                        value: GPS[deviceAttributes[key]]
                    };
                    break;
                case 'lowPowerStatus':
                    obj = {
                        key,
                        status: deviceAttributes[key] === 1 ? 'violation' : 'safe',
                        value: deviceAttributes[key] === 1 ? 'Low Power' : 'Ok'
                    };
                    break;
                default:
                    obj = {
                        value: `${deviceAttributes[key]}`,
                        status: 'still',
                        key
                    };
                    break;
            }
            newDeviceAttributes[key] = obj;
        });
        finalResponse = {...finalResponse, ...deviceResponse[0].device, ...newDeviceAttributes};

        returnObj = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', finalResponse);
    } else {
        returnObj = fennixResponse(statusCodeConstants.STATUS_NO_DEVICES_FOR_ID, 'EN_US', []);
    }
    return returnObj;
};
// const unlinkDeviceForBeneficiaryBusiness = async (req) => {
//     let request = parseInt(req.query.beneficiaryId);
//     await deviceAccessor.unlinkDeviceForBeneficiaryAccessor(request);
//     return fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', []);
// };
const unlinkDeviceForBeneficiaryBusiness = async (req) => {
    let request = parseInt(req.query.beneficiaryId),
        benRequest = {beneficiaryId: req.query.beneficiaryId, deviceId: null};
    //unlinking the device for beneficiary in devices collection, beneficiaries table & locationAttributesMaster collection
    await deviceAccessor.unlinkDeviceForBeneficiaryAccessor(request);
    await beneficiaryAccessor.updateBeneficiaryAccessor(benRequest);
    await deviceAccessor.unlinkLocationMasterForBeneficiaryAccessor(request);
    return fennixResponse(statusCodeConstants.STATUS_DELINK_DEVICE_SUCCESS, 'EN_US', []);
};

// const listUnAssignedDevicesBusiness = async (req) => {
//     let request = {centerId: parseInt(req.query.centerId)}, response, unAssignedDevices = [], finalResponse;
//     response = await deviceAccessor.listUnAssignedDevicesAccessor(request);
//     if (arrayNotEmptyCheck(response)) {
//         response.forEach((item) => {
//             let modifiedResponse = {
//                 id: item['_id'],
//                 imei: item['imei'],
//                 isActive: item['active'],
//                 deviceType: item['deviceTypes']['name'],
//                 phoneNo: item['simcards']['phoneNo'],
//                 deviceId: item['_id']
//             };
//             unAssignedDevices.push(modifiedResponse);
//         });
//         finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', unAssignedDevices);
//     } else {
//         finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_DEVICES_FOR_ID, 'EN_US', []);
//     }
//     return finalResponse;
// };
const listUnAssignedDevicesForContainerBusiness = async () => {
    let response, unAssignedDevices = [], finalResponse;
    response = await deviceAccessor.listUnAssignedDevicesForContainerAccessor();
    if (arrayNotEmptyCheck(response)) {
        response.forEach((item) => {
            let modifiedResponse = {
                id: item['_id'],
                imei: item['imei'],
                isActive: item['active'],
                deviceType: item['deviceTypes']['name'],
                deviceId: item['_id'],
                phoneNo: item['simcards']['phoneNo']
            };
            unAssignedDevices.push(modifiedResponse);
        });
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', unAssignedDevices);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_DEVICES_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};

const unlinkDeviceForContainerBusiness = async (req) => {
    let request = parseInt(req.query.tripId), tripResponse, finalResponse,
        containerRequest = {containerId: 0, deviceId: null};
    //unlinking the device for container in devices collection, beneficiaries table & locationAttributesMaster collection=
    tripResponse = await tripAccessors.getTripDetailsByTripIdAccessor(request);
    if (tripResponse.length > 0) {
        containerRequest.containerId = parseInt(tripResponse[0]['containerId'], 10);
        await deviceAccessor.unlinkDeviceForContainerAccessor(containerRequest.containerId);
        await containerAccessor.updateContainerAccessor(containerRequest);
        await deviceAccessor.unlinkLocationMasterForContainerAccessor(containerRequest.containerId);
        finalResponse = fennixResponse(statusCodeConstants.STATUS_DELINK_DEVICE_SUCCESS, 'EN_US', []);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_DELINK_ELOCK_FAILED, 'EN_US', []);
    }
    return finalResponse;
};
/**
 * @description Checking if the device is present by checking if the IMEI is Uniques as IMEI must be unique for a device
 * @param req:IMEI as a part of request query
 * @return Promise of boolean
 */
const checkIfDeviceIsPresentBusiness = async (req) => {
    let response;
    response = await deviceAccessor.checkIfDeviceIsPresentAccessor(parseInt(req.query.imei));
    return response === 0 ? fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', response) : fennixResponse(statusCodeConstants.STATUS_DEVICE_ALREADY_EXISTS_FOR_GIVEN_IMEI, 'EN_US', []);
};
const getPhoneNoForContainerBusiness = async (req) => {
    let request = parseInt(req.query.containerId), response, finalResponse, obj;
    response = await deviceAccessor.getPhoneNoForContainerAccessor(request);
    if (arrayNotEmptyCheck(response)) {
        obj = {
            phoneNo: response[0]['simcards']['phoneNo'],
            containerId: response[0]['containerId']
        };
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', obj);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_DEVICES_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};

const editDeviceBusiness = async (req) => {
    let deviceId = parseInt(req.body.deviceId), mainReq = req.body, response, finalResponse, mongoReq;
    delete mainReq.deviceId;
    mongoReq = mongoUpdateQueryCreator(mainReq);
    console.log(mongoReq);
    response = deviceAccessor.editDeviceAccessor(deviceId, mongoReq);
    if (notNullCheck(response)) {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', 'Updated device successfully');
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_DEVICES_FOR_ID, 'EN_US', 'Error while updating device details');
    }
    return finalResponse;
};

const deleteDeviceBusiness = async (req) => {
    let deviceId = parseInt(req.body.deviceId), request = {active: false}, response, finalResponse, mongoReq;
    mongoReq = mongoUpdateQueryCreator(request);
    response = deviceAccessor.editDeviceAccessor(deviceId, mongoReq);
    if (notNullCheck(response)) {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', 'Updated device successfully');
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_DEVICES_FOR_ID, 'EN_US', 'Error while updating device details');
    }
    return finalResponse;
};

const listUnAssignedDevicesBusiness = async (req) => {
    let request = {centerId: parseInt(req.query.centerId)}, response, unAssignedDevices = [], finalResponse,
        userResponse;
    userResponse = await userAccessor.getUserNameFromUserIdAccessor([req.query.languageId, req.query.userId]);
    //TODO: below is the temp fix. need to fetch centers for logged in user which is in userAccessor later
    if (objectHasPropertyCheck(userResponse, 'rows') && arrayNotEmptyCheck(userResponse.rows)) {
        response = userResponse.rows[0]['native_user_role'] === 'ROLE_GLOBAL_ADMIN' ? await deviceAccessor.listUnAssignedDevicesForGlobalAdminAccessor() : await deviceAccessor.listUnAssignedDevicesAccessor(request);
        if (arrayNotEmptyCheck(response)) {
            response.forEach((item) => {
                let modifiedResponse = {
                    id: item['_id'],
                    imei: item['imei'],
                    isActive: item['active'],
                    deviceType: item['deviceTypes']['name'],
                    phoneNo: item['simcards']['phoneNo'],
                    deviceId: item['_id']
                };
                unAssignedDevices.push(modifiedResponse);
            });
            finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', unAssignedDevices);
        } else {
            finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_DEVICES_FOR_ID, 'EN_US', []);
        }
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_USER_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};

module.exports = {
    deviceAggregatorDashboard,
    editDeviceBusiness,
    listDevicesBusiness,
    deleteDeviceBusiness,
    insertDeviceBusiness,
    getPhoneNoForContainerBusiness,
    checkIfDeviceIsPresentBusiness,
    getDeviceByDeviceIdBusiness,
    listDeviceTypesBusiness,
    listUnAssignedDevicesBusiness,
    unlinkDeviceForContainerBusiness,
    listUnAssignedDevicesForContainerBusiness,
    unlinkDeviceForBeneficiaryBusiness,
    listElockDevicesBusiness,
    getDeviceDetailsByBeneficiaryIdBusiness
};
