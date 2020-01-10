const tripAccessors = require('../../repository-module/data-accesors/trip-accessor');
const containerAccessors = require('../../repository-module/data-accesors/container-accessor');
const userAccessors = require('../../repository-module/data-accesors/user-accesor');
const {notificationEmailBusiness} = require('../common-business-module/common-business');
const {responseObjectCreator} = require('../../util-module/data-validators');
const COMMON_CONSTANTS = require('../../util-module/util-constants/fennix-common-constants');
const {arrayNotEmptyCheck, objectHasPropertyCheck, notNullCheck} = require('../../util-module/data-validators');
const {fennixResponse} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const {statusCodeConstants} = require('../../util-module/response-status-constants/status-code-constants');
const axios = require('axios');

const fetchTripDetailsBusiness = async (req) => {
    let userRequest = {query: {userId: req.body.userId, languageId: req.body.languageId}}, request = {},
        mongoRequest = req.body.searchValue ? {
            status: ["IN_PROGRESS"],
            containerId: {$in: []},
            searchValue: req.body.searchValue
        } : {status: ["IN_PROGRESS"], containerId: {$in: []}},
        tripResponse;
    tripResponse = await commonFetchTripDetails(userRequest, mongoRequest, request);
    return fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', tripResponse);
};
const fetchCompletedTripDetailsBusiness = async (req) => {
    let userRequest = {query: {userId: req.body.userId, languageId: req.body.languageId}}, request = {},
        mongoRequest = req.body.searchValue ? {
            status: ["COMPLETED"],
            containerId: {$in: []},
            searchValue: req.body.searchValue
        } : {status: ["COMPLETED"], containerId: {$in: []}},
        tripResponse;
    tripResponse = await commonFetchTripDetails(userRequest, mongoRequest, request);
    return fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', tripResponse);
};


const startTripBusiness = async (req) => {
    let response, notificationsResponse;
    notificationsResponse = await tripAccessors.getNotificationEmailsForTripIdAccessor({tripId: req.query.tripId});
    if (notNullCheck(notificationsResponse)) {
        await containerAccessors.setContainerLockStatusAccessor([parseInt(notificationsResponse[0].containerId), true]);
        await tripAccessors.updateTripStatusAccessor({
            tripId: req.query.tripId,
            tripStatus: 'IN_PROGRESS',
            tripActualStartTime: new Date()
        });
        // activePasswordResponse[0]['active_password']
        // const activePasswordResponse = await tripAccessors.getActivePasswordForContainerIdAccessor([notificationsResponse.containerId]);
        // if (objectHasPropertyCheck(activePasswordResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(activePasswordResponse.rows)) {
        socket.socketIO.emit('set_active_password', {
            newPassword: '100000',
            oldPassword: '100000'
        });
        // }
        notificationEmailBusiness(notificationsResponse[0].notificationEmail1, 'start_trip');
        notificationEmailBusiness(notificationsResponse[0].notificationEmail2, 'start_trip');
        notificationEmailBusiness(notificationsResponse[0].notificationEmail3, 'start_trip');
    }
    return fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', '');
};

const getTripStatusName = (tripStatus) => {
    const tripStatusMap = {NOT_STARTED: 'Not Started', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed'};
    return tripStatusMap[tripStatus];
};
const endTripBusiness = async (req) => {
    let response, notificationsResponse;
    notificationsResponse = await tripAccessors.getNotificationEmailsForTripIdAccessor({tripId: req.query.tripId});
    if (notNullCheck(notificationsResponse)) {
        let startDateTime = new Date(notificationsResponse[0]['tripActualStartTime']);
        let endDateTime = new Date();
        let tripDuration = Math.abs(endDateTime.getTime() - startDateTime.getTime());
        tripAccessors.updateTripStatusAccessor({
            tripId: req.query.tripId,
            tripStatus: 'COMPLETED',
            tripActualEndTime: endDateTime,
            tripActualDuration: tripDuration
        });
        notificationEmailBusiness(notificationsResponse[0].notificationEmail1, 'end_trip');
        notificationEmailBusiness(notificationsResponse[0].notificationEmail2, 'end_trip');
        notificationEmailBusiness(notificationsResponse[0].notificationEmail3, 'end_trip');
    }
    return fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', '');
};
// const fetchCompletedTripDetailsBusiness = async (req) => {
//     let userRequest = {query: {userId: req.query.userId, languageId: req.query.languageId}}, request = {},
//         mongoRequest = {status: ["COMPLETED"], containerId: {$in: []}},
//         tripResponse;
//     tripResponse = await commonFetchTripDetails(userRequest, mongoRequest, request);
//     return fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', tripResponse);
// };

const tripStatusAggregatorBusiness = async () => {
    let response, returnResponse, tripStatusMap = {
        NOT_STARTED: 'notStarted',
        IN_PROGRESS: 'inProgress',
        COMPLETED: 'completed'
    }, returnObj = {
        notStarted: {value: 0, legend: 'NOT STARTED', key: 'notStarted'},
        inProgress: {value: 0, legend: 'IN PROGRESS', key: 'inProgress'},
        completed: {value: 0, legend: 'COMPLETED', key: 'completed'}
    };
    response = await tripAccessors.tripStatusAggregatorAccessor();
    if (arrayNotEmptyCheck(response)) {
        console.log(response);
        response.forEach((item) => {
            if (objectHasPropertyCheck(tripStatusMap, item._id)) {
                returnObj[tripStatusMap[item._id]].value = item.count;
            }
        });
        returnResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', returnObj);
    } else {
        returnResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', '');
    }


    return returnResponse;
};

const commonFetchTripDetails = async (userRequest, mongoRequest, request) => {
    let containerListResponse, response, tripResponse = {gridData: []}, containerCompNameMap = {};
    let userResponse = await userAccessors.getUserIdsForAllRolesAccessor(userRequest, COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID_NATIVE_ROLE);
    request.userIdList = userResponse.userIdsList;
    request.nativeUserRole = userResponse.nativeUserRole;
    console.log(request);
    containerListResponse = await containerAccessors.getContainerIdListAccessor(request);
    console.log(containerListResponse);
    if (objectHasPropertyCheck(containerListResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(containerListResponse.rows)) {
        containerListResponse.rows.forEach((item) => {
            mongoRequest.containerId.$in.push(item['container_id']);
            containerCompNameMap[item['container_id']] = {
                containerName: item['container_name'],
                companyName: item['company_name']
            };
        });
        console.log(mongoRequest);
        response = await tripAccessors.fetchTripDetailsAccessor(mongoRequest);
        console.log('trip response', response);
        if (arrayNotEmptyCheck(response)) {
            let formattedArray = [];
            response.forEach((item) => {
                const obj = {
                    tripId: item['tripId'],
                    tripName: item['tripName'],
                    tripStartAddress: item['startAddress']['name'],
                    tripEndAddress: item['endAddress']['name'],
                    tripStartTime: item['startDate'],
                    tripEndTime: item['endDate'],
                    tripStatus: getTripStatusName(item['tripStatus']),
                    tripDuration: item['tripDuration'] ? item['tripDuration'] : '-',
                    tripActualStartDateTime: item['actualStartDate'] ? item['actualStartDate'] : '-',
                    tripActualEndDateTime: item['actualEndDate'] ? item['actualEndDate'] : '-',
                    tripActualDuration: item['actualDuration'] ? item['actualDuration'] : '-',
                    containerName: containerCompNameMap[item['containerId']]['containerName'],
                    companyName: containerCompNameMap[item['containerId']]['companyName']
                };
                formattedArray.push(obj);
            });
            tripResponse.gridData = formattedArray;
            tripResponse.totalNoOfRecords = response.length;
        }
    }
    return tripResponse;
};
// const fetchTripDetailsBusiness = async (req) => {
//     let userRequest = {query: {userId: req.query.userId, languageId: req.query.languageId}}, request = {},
//         mongoRequest = {status: ["IN_PROGRESS"], containerId: {$in: []}},
//         tripResponse;
//     tripResponse = await commonFetchTripDetails(userRequest, mongoRequest, request);
//     return fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', tripResponse);
// };

const fetchCompleteDeviceDetailsByTripIdBusiness = async (req) => {
    let response, modifiedResponse = {gridData: []}, finalResponse;
    response = await tripAccessors.fetchCompleteDeviceDetailsByTripIdAccessor(parseInt(req.query.tripId));
    if (arrayNotEmptyCheck(response)) {
        response.forEach((item) => {
            let obj1 = responseObjectCreator(item, ['tripId', 'lat', 'lng', 'deviceId', 'containerId', 'locationId', 'deviceDate'], ['tripId', 'latitude', 'longitude', 'deviceId', 'containerId', '_id', 'deviceDate']);
            let obj2 = responseObjectCreator(item['deviceAttributes'][0], ['gps', 'direction', 'mileage', 'speed', 'gpsStatus', 'serverDate', 'batteryPercentage', 'deviceUpdatedDate', 'deviceAttributeId'], ['gps', 'direction', 'mileage', 'speed', 'gpsStatus', 'serverDate', 'batteryPercentage', 'deviceUpdatedDate', '_id']);
            modifiedResponse.gridData.push({...obj1, ...obj2});
        });
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_COMPANY_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};
const getMapRouteGoogleDetailsBusiness = async (req) => {
    let returnResponse;
    const googleResponse = await axios.get(`https://roads.googleapis.com/v1/snapToRoads?path=${req.query.locationArray}6&interpolate=true&key=AIzaSyCVO7onAj7X9PLkvQkrDZrOFWNwEFMeyu0`);
    if (googleResponse && objectHasPropertyCheck(googleResponse, 'data') && objectHasPropertyCheck(googleResponse.data, 'snappedPoints')) {
        returnResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', googleResponse.data.snappedPoints);
    } else {
        returnResponse = fennixResponse(statusCodeConstants.STATUS_NO_LOCATION_EXISTS_FOR_GIVEN_ID, 'EN_US', []);
    }
    return returnResponse;
};
// const getTripMapHistoryByTripIdBusiness
const fetchNotStartedTripDetailsBusiness = async (req) => {
    let userRequest = {query: {userId: req.query.userId, languageId: req.query.languageId}}, request = {},
        mongoRequest = {status: ["NOT_STARTED"], containerId: {$in: []}},
        tripResponse;
    tripResponse = await commonFetchTripDetails(userRequest, mongoRequest, request);
    return fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', tripResponse);
};

const fetchTripDetailsByTripIdBusiness = async (req) => {
    const tripId = parseInt(req.query.tripId, 10);
    let tripResponse;
    tripResponse = await tripAccessors.getTripDetailsByTripIdAccessor(tripId);
    if (tripResponse) {
        console.log(tripResponse);
    }
    return tripResponse;
};

const fetchTripHistoryBusiness = async (req) => {
    let response, tripResponse, modifiedResponse = {tripData: [], geoFence: []}, finalResponse;
    response = await tripAccessors.fetchCompleteDeviceDetailsByTripIdAccessor(parseInt(req.query.tripId));
    if (arrayNotEmptyCheck(response)) {
        tripResponse = await tripAccessors.getTripDetailsByTripIdAccessor(parseInt(req.query.tripId));
        response.forEach((item) => {
            let obj1 = responseObjectCreator(item, ['tripId', 'lat', 'lng'], ['tripId', 'latitude', 'longitude']);
            let obj2 = responseObjectCreator(item['deviceAttributes'][0], ['speed'], ['speed']);
            modifiedResponse.tripData.push({...obj1, ...obj2});
        });

        if (arrayNotEmptyCheck(tripResponse)) {
            tripResponse.forEach((item) => {
                modifiedResponse.geoFence.push(responseObjectCreator(item, ['lat', 'lng'], ['lat', 'lng']));
            });
        }
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', []);
    }
    return finalResponse;
};

const editTripBusiness = async (req) => {
    let request = {status: "NOT_STARTED", containerId: {$in: [req.body.containerId]}, tripId: req.body.tripId},
        latArray = [], lngArray = [], restrictionRequestList = [], modifiedResponse, tripRequest = req.body;
    let tripDetailsResponse = await tripAccessors.fetchTripDetailsAccessor(request);
    if (arrayNotEmptyCheck(tripDetailsResponse) && tripDetailsResponse[0]['tripStatus'] === "NOT_STARTED") {
        tripRequest = {
            tripId: req.body.tripId,
            containerId: parseInt(req.body.containerId, 10),
            deviceId: parseInt(req.body.deviceId, 10),
            startAddress: objectHasPropertyCheck(req.body, 'address') ? req.body.address.startAddress : '',
            endAddress: objectHasPropertyCheck(req.body, 'address') ? req.body.address.endAddress : '',
            startDate: getDateTimeStamp(req.body.expectedStartDate, req.body.expectedStartTime),
            endDate: getDateTimeStamp(req.body.expectedEndDate, req.body.expectedEndTime),
            tripName: req.body.tripName,
            startTime: req.body.expectedStartTime,
            endTime: req.body.expectedEndTime,
            tripDuration: getTripDuration({
                startDate: req.body.expectedStartDate,
                startTime: req.body.expectedStartTime,
                endDate: req.body.expectedEndDate,
                endTime: req.body.expectedEndTime
            }),
            tripStatus: 'NOT_STARTED',
            notificationEmail1: req.body.notificationEmail1,
            notificationEmail2: req.body.notificationEmail2,
            notificationEmail3: req.body.notificationEmail3,
            isTripActive: true
        };
        restrictionRequestList = objectHasPropertyCheck(req.body, 'address') && objectHasPropertyCheck(req.body.address, 'restriction') && arrayNotEmptyCheck(req.body.address['restriction']) ? req.body.address['restriction'] : [];
        restrictionRequestList.forEach(item => {
            latArray.push(item['lat']);
            lngArray.push(item['lng']);
        });
        tripRequest = {
            ...tripRequest,
            restrictions: restrictionRequestList,
            latArray: latArray,
            lngArray: lngArray,
            createdDate: new Date()
        };
        tripAccessors.updateTripStatusAccessor(tripRequest);
        modifiedResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', []);
    } else {
        modifiedResponse = fennixResponse(statusCodeConstants.STATUS_NO_CONTAINER_ERROR, 'EN_US', []);
    }
    return modifiedResponse;
};
const getTripDuration = (dateTime, timeFlag) => {
    let startTime = dateTime.startTime, endTime = dateTime.endTime, startDate = new Date(dateTime.startDate),
        endDate = new Date(dateTime.endDate);
    if (timeFlag) {
        startTime = timeHoursToMillisecondConverter(startTime);
        endTime = timeHoursToMillisecondConverter(endTime);
        startDate.setTime(startTime);
        endDate.setTime(endTime);
    }
    return Math.abs(startDate.getTime() - endDate.getTime());
};

const getDateTimeStamp = (date, time) => {
    let timeInMilliSeconds = timeHoursToMillisecondConverter(time), actualDate = new Date(date);
    actualDate.setTime(timeInMilliSeconds);
    return actualDate;
};
const timeHoursToMillisecondConverter = (time) => {
    let splitTime = time.split(':');
    return ((splitTime[0] * (60000 * 60)) + (splitTime[1] * 60000));
};

const fetchTripDetailsFiltersBusiness = async (req) => {
    let userRequest = {query: {userId: req.body.userId, languageId: req.body.languageId}}, request = {},containerListResponse, containerCompNameMap = {},
        mongoRequest = {
            status: ["IN_PROGRESS"],
            containerId: {$in: []},
        }, tripResponse, finalResponse = {gridData: []}, response;
    let userResponse = await userAccessors.getUserIdsForAllRolesAccessor(userRequest, COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID_NATIVE_ROLE);
    console.log(userResponse);
    request.userIdList = userResponse.userIdsList;
    request.nativeUserRole = userResponse.nativeUserRole;
    if (arrayNotEmptyCheck(req.body.pageFilters)) {
        req.body.pageFilters.forEach((item) => {
           if (item['key'] === 'companyName') {
               request.companyName = item['value'];
           }
           if (item['key'] === 'origin') {
               mongoRequest.origin = {'startAddress.name': item['value']};
           }
            if (item['key'] === 'destination') {
                mongoRequest.destination = {'endAddress.name': item['value']};
            }
        });
    }
    containerListResponse = await containerAccessors.getContainerIdListFilterAccessor(request);
    if (objectHasPropertyCheck(containerListResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(containerListResponse.rows)) {
        containerListResponse.rows.forEach((item) => {
            mongoRequest.containerId.$in.push(item['container_id']);
            containerCompNameMap[item['container_id']] = {containerName: item['container_name'], companyName: item['company_name']};
        });
        console.log(mongoRequest);
        tripResponse = await tripAccessors.fetchTripDetailsFilterAccessor(mongoRequest);
        console.log(tripResponse);
        if (arrayNotEmptyCheck(tripResponse)) {
            let formattedArray = [];
            tripResponse.forEach((item) => {
                const obj = {
                    tripId: item['tripId'],
                    tripName: item['tripName'],
                    tripStartAddress: item['startAddress']['name'],
                    tripEndAddress: item['endAddress']['name'],
                    tripStartTime: item['startDate'],
                    tripEndTime: item['endDate'],
                    tripStatus: getTripStatusName(item['tripStatus']),
                    tripDuration: item['tripDuration'] ? item['tripDuration'] : '-',
                    tripActualStartDateTime: item['actualStartDate'] ? item['actualStartDate'] : '-',
                    tripActualEndDateTime: item['actualEndDate'] ? item['actualEndDate'] : '-',
                    tripActualDuration: item['actualDuration'] ? item['actualDuration'] : '-',
                    containerName: containerCompNameMap[item['containerId']]['containerName'],
                    companyName: containerCompNameMap[item['containerId']]['companyName']
                };
                formattedArray.push(obj);
            });
            finalResponse.gridData = formattedArray;
            //TODO: fix length by writing new trip query to fetch total records count
            finalResponse.totalNoOfRecords = tripResponse.length;
            response = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', finalResponse);
        }
    } else {
        response = fennixResponse(statusCodeConstants.STATUS_NO_CONTAINER_FOR_ID, 'EN_US', finalResponse);
    }
    return response;
};

const fetchCompletedTripDetailsFiltersBusiness = async (req) => {
    let userRequest = {query: {userId: req.body.userId, languageId: req.body.languageId}}, request = {},containerListResponse, containerCompNameMap = {},
        mongoRequest = {
            status: ["COMPLETED"],
            containerId: {$in: []},
        }, tripResponse, finalResponse = {gridData: []}, response;
    let userResponse = await userAccessors.getUserIdsForAllRolesAccessor(userRequest, COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID_NATIVE_ROLE);
    console.log(userResponse);
    request.userIdList = userResponse.userIdsList;
    request.nativeUserRole = userResponse.nativeUserRole;
    if (arrayNotEmptyCheck(req.body.pageFilters)) {
        req.body.pageFilters.forEach((item) => {
            if (item['key'] === 'companyName') {
                request.companyName = item['value'];
            }
            if (item['key'] === 'origin') {
                mongoRequest.origin = {'startAddress.name': item['value']};
            }
            if (item['key'] === 'destination') {
                mongoRequest.destination = {'endAddress.name': item['value']};
            }
        });
    }
    containerListResponse = await containerAccessors.getContainerIdListFilterAccessor(request);
    if (objectHasPropertyCheck(containerListResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(containerListResponse.rows)) {
        containerListResponse.rows.forEach((item) => {
            mongoRequest.containerId.$in.push(item['container_id']);
            containerCompNameMap[item['container_id']] = {containerName: item['container_name'], companyName: item['company_name']};
        });
        console.log(mongoRequest);
        tripResponse = await tripAccessors.fetchTripDetailsFilterAccessor(mongoRequest);
        console.log(tripResponse);
        if (arrayNotEmptyCheck(tripResponse)) {
            let formattedArray = [];
            tripResponse.forEach((item) => {
                const obj = {
                    tripId: item['tripId'],
                    tripName: item['tripName'],
                    tripStartAddress: item['startAddress']['name'],
                    tripEndAddress: item['endAddress']['name'],
                    tripStartTime: item['startDate'],
                    tripEndTime: item['endDate'],
                    tripStatus: getTripStatusName(item['tripStatus']),
                    tripDuration: item['tripDuration'] ? item['tripDuration'] : '-',
                    tripActualStartDateTime: item['actualStartDate'] ? item['actualStartDate'] : '-',
                    tripActualEndDateTime: item['actualEndDate'] ? item['actualEndDate'] : '-',
                    tripActualDuration: item['actualDuration'] ? item['actualDuration'] : '-',
                    containerName: containerCompNameMap[item['containerId']]['containerName'],
                    companyName: containerCompNameMap[item['containerId']]['companyName']
                };
                formattedArray.push(obj);
            });
            finalResponse.gridData = formattedArray;
            //TODO: fix length by writing new trip query to fetch total records count
            finalResponse.totalNoOfRecords = tripResponse.length;
            response = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', finalResponse);
        }
    } else {
        response = fennixResponse(statusCodeConstants.STATUS_NO_CONTAINER_FOR_ID, 'EN_US', finalResponse);
    }
    return response;
};


module.exports = {
    fetchCompletedTripDetailsFiltersBusiness,
    fetchTripDetailsFiltersBusiness,
    fetchTripDetailsBusiness,
    startTripBusiness,
    fetchNotStartedTripDetailsBusiness,
    fetchCompletedTripDetailsBusiness,
    fetchCompleteDeviceDetailsByTripIdBusiness,
    endTripBusiness,
    editTripBusiness,
    fetchTripHistoryBusiness,
    fetchTripDetailsByTripIdBusiness,
    tripStatusAggregatorBusiness,
    getMapRouteGoogleDetailsBusiness
};
