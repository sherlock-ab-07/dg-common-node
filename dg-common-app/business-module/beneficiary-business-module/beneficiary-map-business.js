const beneficiaryAccessor = require('../../repository-module/data-accesors/beneficiary-accesor');
const {objectHasPropertyCheck, deviceStatusMapper, arrayNotEmptyCheck, notNullCheck, responseObjectCreator} = require('../../util-module/data-validators');
const {fennixResponse} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const {statusCodeConstants} = require('../../util-module/response-status-constants/status-code-constants');
const {deviceByBeneficiaryIdAccessor} = require('../../repository-module/data-accesors/device-accesor');
const {getBeneficiaryMapHistoryAccessor} = require('../../repository-module/data-accesors/location-accesor');
const restrictionAccessor = require('../../repository-module/data-accesors/restriction-accesor');
const COMMON_CONSTANTS = require('../../util-module/util-constants/fennix-common-constants');
const momentTimezone = require('moment-timezone');
const {deviceStatusCreator} = require('../../util-module/device-status-creator');
const geofenceValidator = (geoFenceArray, location) => {
    const latArray = [], lngArray = [];
    geoFenceArray[0].locationDetails.forEach((item) => {
        latArray.push(item['lat']);
        lngArray.push(item['lng']);
    });
    latArray.sort((prev, next) => prev - next);
    lngArray.sort((prev, next) => prev - next);
    return ((location.latitude > latArray[0] && location.latitude < latArray[latArray.length - 1]) && (location.longitude > lngArray[0] && location.longitude < lngArray[lngArray.length - 1]));
};

const beneficiaryTrackMapBusiness = async (req) => {
    let beneficiaryReturnObj = {}, gridData = {}, locationObj = {},
        beneficiaryDevices = {}, beneficiaryListResponse, returnObj,
        newReq = {
            query: {
                userId: req.body.userId,
                centerId: req.body.centerId,
                sort: req.body.sort,
                skip: parseInt(req.body.skip),
                limit: parseInt(req.body.limit),
                languageId: req.body.languageId
            }
        };
    beneficiaryListResponse = await beneficiaryAccessor.getBeneifciaryIdList(newReq);
    if (objectHasPropertyCheck(beneficiaryListResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(beneficiaryListResponse.rows)) {
        let beneficiaryIdListAndDetailObj, beneficiaryDeviceArray;
        beneficiaryIdListAndDetailObj = beneficiaryListResponse.rows.reduce((init, item) => {
            init.beneficiaryIdArray.push(parseInt(item.beneficiaryid));
            init.beneficiaryDetailObj[item.beneficiaryid] = responseObjectCreator(item, ['beneficiaryId', 'firstName', 'documentId', 'mobileNo', 'image', 'emailId', 'beneficiaryRoleId', 'gender', 'beneficiaryRoleName'], ['beneficiaryid', 'firstname', 'document_id', 'mobileno', 'image', 'emailid', 'role_id', 'gender', 'role_name']);
            return init;
        }, {beneficiaryIdArray: [], beneficiaryDetailObj: {}});
        beneficiaryDeviceArray = await deviceByBeneficiaryIdAccessor(beneficiaryIdListAndDetailObj.beneficiaryIdArray);
        if (arrayNotEmptyCheck(beneficiaryDeviceArray)) {
            beneficiaryDeviceArray.forEach((item) => {
                locationObj[item.beneficiaryId] = {...beneficiaryIdListAndDetailObj['beneficiaryDetailObj'][item.beneficiaryId]};
                locationObj[item.beneficiaryId]['location'] = {
                    longitude: item.location.longitude,
                    latitude: item.location.latitude
                };
                beneficiaryIdListAndDetailObj['beneficiaryDetailObj'][item.beneficiaryId]['imei'] = item['device']['imei'];
                locationObj[item.beneficiaryId]['roleId'] = beneficiaryIdListAndDetailObj['beneficiaryDetailObj'][item.beneficiaryId]['roleId'];
                const deviceDetails = {};
                let noOfViolations = 0;
                let differenceTime = Math.floor((new Date().getTime() - new Date(`${item.deviceAttributes.serverDate}`).getTime()) / 1000 / 60);
                const onlineStatusFlag = differenceTime < 3;
                deviceDetails[item.beneficiaryId] = [];
                const GPS = {A: 'Valid', V: 'Invalid'};
                const batteryPercentage = deviceStatusMapper('batteryPercentage', item.deviceAttributes.batteryPercentage);
                if (batteryPercentage['deviceStatus'] === 'violation') {
                    noOfViolations += 1;
                }
                if (item.deviceAttributes.beltStatus === 1) {
                    noOfViolations += 1;
                }
                if (item.deviceAttributes.shellStatus === 1) {
                    noOfViolations += 1;
                }
                // TODO refactor further - add the value checking and condition checking in the helper method
                deviceDetails[item.beneficiaryId].push(
                    deviceStatusCreator('Battery', 'battery_charging_full', `${item.deviceAttributes.batteryPercentage}%`, batteryPercentage['deviceStatus'], 'batteryPercentage', onlineStatusFlag)
                );
                deviceDetails[item.beneficiaryId].push(
                    deviceStatusCreator('Belt', 'link', item.deviceAttributes.beltStatus === 1 ? 'belt' : 'OK', item.deviceAttributes.beltStatus === 1 ? 'violation' : 'safe', 'beltStatus', onlineStatusFlag)
                );
                deviceDetails[item.beneficiaryId].push(
                    deviceStatusCreator('Shell', 'lock', item.deviceAttributes.shellStatus === 1 ? 'shell' : 'OK', item.deviceAttributes.shellStatus === 1 ? 'violation' : 'safe', 'shellStatus', onlineStatusFlag)
                );
                deviceDetails[item.beneficiaryId].push(
                    deviceStatusCreator('GFence', 'map', item.locationRestriction && arrayNotEmptyCheck(item.locationRestriction.restrictions) ? geofenceValidator(item.locationRestriction.restrictions, item.location) ? 'in' : 'out' : '-', item.locationRestriction && arrayNotEmptyCheck(item.locationRestriction.restrictions) ? geofenceValidator(item.locationRestriction.restrictions, item.location) ? 'safe' : 'violation' : 'still', 'geoFence', onlineStatusFlag)
                );
                deviceDetails[item.beneficiaryId].push(
                    deviceStatusCreator('GSM', 'signal_cellular_4_bar', item.deviceAttributes.gsmSignal < 2 ? 'Low' : 'OK', item.deviceAttributes.gsmSignal < 2 ? 'violation' : 'safe', 'gmsStatus', onlineStatusFlag)
                );
                deviceDetails[item.beneficiaryId].push(
                    deviceStatusCreator('RF Home', 'home', item.deviceAttributes.rfConnectionStatus === 0 ? 'Outdoor' : 'Home', item.deviceAttributes.rfConnectionStatus === 0 ? 'violation' : 'safe', 'rfConnectionStatus', onlineStatusFlag)
                );
                deviceDetails[item.beneficiaryId].push(
                    deviceStatusCreator('RFID', 'rss_feed', item.deviceAttributes.rfPlugStatus === 0 ? 'Out' : 'In', item.deviceAttributes.rfPlugStatus === 0 ? 'violation' : 'safe', 'rfPlugStatus', onlineStatusFlag)
                );
                deviceDetails[item.beneficiaryId].push(
                    deviceStatusCreator('SAT', 'gps_fixed', GPS[item.deviceAttributes.gpsStatus], item.deviceAttributes.gpsStatus === 'V' ? 'violation' : 'safe', 'gpsStatus', onlineStatusFlag)
                    );
                deviceDetails[item.beneficiaryId].push(
                    deviceStatusCreator('Speed', 'directions_run', Math.floor(item.deviceAttributes.speed), item.deviceAttributes.speed > 0 ? 'moving' : 'still', 'speed', onlineStatusFlag)
                    );
                deviceDetails[item.beneficiaryId].push({
                    text: 'BStatus',
                    key: 'online',
                    icon: 'radio_button_checked',
                    status: differenceTime < 3 ? 'safe' : 'violation',
                    value: differenceTime < 3 ? 'Online' : 'Offline'
                });
                beneficiaryDevices = {...deviceDetails};
                const completeDate = new Date(`${item.deviceAttributes.deviceUpdatedDate}`);
                beneficiaryIdListAndDetailObj.beneficiaryDetailObj[item.beneficiaryId]['deviceUpdatedDate'] = momentTimezone.tz(completeDate, 'America/Santo_Domingo').format();
                beneficiaryIdListAndDetailObj.beneficiaryDetailObj[item.beneficiaryId]['deviceDetails'] = deviceDetails[item.beneficiaryId];
                beneficiaryIdListAndDetailObj.beneficiaryDetailObj[item.beneficiaryId]['noOfViolations'] = {
                    text: 'Number of Violations',
                    value: noOfViolations
                };
                locationObj[item.beneficiaryId]['noOfViolations'] = noOfViolations;
                gridData[item.beneficiaryId] = {...beneficiaryIdListAndDetailObj.beneficiaryDetailObj[item.beneficiaryId]};
            });
        }
        beneficiaryReturnObj['markers'] = Object.keys(locationObj).map(key => locationObj[key]);
        beneficiaryReturnObj['deviceDetails'] = beneficiaryDevices;
        beneficiaryReturnObj['deviceDetailsArray'] = Object.keys(beneficiaryDevices).map((device) => beneficiaryDevices[device]);
        beneficiaryReturnObj['gridData'] = Object.keys(gridData).map(data => gridData[data]);
        beneficiaryReturnObj['markerDetails'] = gridData;
        returnObj = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', beneficiaryReturnObj);
    } else {
        returnObj = fennixResponse(statusCodeConstants.STATUS_USER_RETIRED, 'EN_US', []);
    }
    return returnObj;
};

const getBeneficiaryMapHistoryBusiness = async (req) => {
    const milliseconds = 3600000;
    let toDate = new Date(), fromDate = new Date(), request,
        finalResponse = {}, modifiedResponse = {}, mapResponseArray = [], geoFence, geoFenceDetails, historyDetails;
    let newGeofenceArray = [];
    if (req.body.pageFilters && notNullCheck(req.body.pageFilters[0])) {
        if (req.body.pageFilters[0]['key'].toLowerCase() === 'daterange') {
            switch (req.body.pageFilters[0]['value']) {
                case '1hr':
                    fromDate.setTime(toDate.getTime() - (1 * milliseconds));
                    break;
                case '2hr':
                    fromDate.setTime(toDate.getTime() - (2 * milliseconds));
                    break;
                case '5hr':
                    fromDate.setTime(toDate.getTime() - (5 * milliseconds));
                    break;
                case '7hr':
                    fromDate.setTime(toDate.getTime() - (7 * milliseconds));
                    break;
                case '12hr':
                    fromDate.setTime(toDate.getTime() - (12 * milliseconds));
                    break;
                case '1day':
                    fromDate.setDate(toDate.getDate() - 1);
                    break;
                case '2day':
                    fromDate.setDate(toDate.getDate() - 2);
                    break;
                case '5day':
                    fromDate.setDate(toDate.getDate() - 5);
                    break;
                default:
                    fromDate.setDate(toDate.getDate() - 1);
            }
        } else if (req.body.pageFilters[0]['key'].toLowerCase() === 'dateinterval') {
            fromDate = req.body.pageFilters[0]['value']['from'];
            toDate = req.body.pageFilters[0]['value']['to'];
        } else if (req.body.pageFilters[0]['key'].toLowerCase() === 'dateindex') {
            const requestDate = req.body.pageFilters[0]['value'];
            fromDate = new Date(requestDate['year'], parseInt(requestDate['month'], 10) - 1, parseInt(requestDate['date'], 10), 12, 0, 0, 0);
            toDate = new Date(requestDate['year'], parseInt(requestDate['month'], 10) - 1, parseInt(requestDate['date'], 10), 23, 59, 59, 59);
        }
    } else {
        fromDate.setDate(toDate.getDate() - 1);
    }
    request = {
        toDate: toDate.toISOString(),
        fromDate: fromDate.toISOString(),
        beneficiaryId: parseInt(req.body.beneficiaryId)
    };
    historyDetails = await getBeneficiaryMapHistoryAccessor(request);
    geoFenceDetails = await restrictionAccessor.fetchLocationRestrictionAccessor(parseInt(req.body.beneficiaryId));
    let beneficiaryDetails = await beneficiaryAccessor.getBeneficiaryByBeneficiaryIdAccesor([parseInt(req.body.beneficiaryId), req.body.languageId]);

    if (objectHasPropertyCheck(beneficiaryDetails, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(beneficiaryDetails.rows)) {
        beneficiaryDetails = beneficiaryDetails.rows[0];
        beneficiaryDetails = responseObjectCreator(beneficiaryDetails, ['fullName', 'role', 'emailId', 'beneficiaryRoleId'], ['full_name', 'role_name', 'emailid', 'beneficiary_role']);
    }
    if (arrayNotEmptyCheck(historyDetails)) {
        historyDetails.forEach((item) => {
            let obj = {
                latitude: item['latitude'],
                beneficiaryRoleId: beneficiaryDetails && beneficiaryDetails.beneficiaryRoleId ? beneficiaryDetails.beneficiaryRoleId : null,
                longitude: item['longitude'],
                deviceDate: item['deviceDate'],
                speed: item['speed']
            };
            mapResponseArray.push(obj);
        });
        if (arrayNotEmptyCheck(geoFenceDetails)) {
            geoFence = geoFenceDetails[0]['restrictions'];
            // if (arrayNotEmptyCheck(geoFence)) {
            //     geoFence.forEach((fence) => {
            //         let fenceArray = [];
            //         fenceArray.concat(fence.locationDetails);
            //         newGeofenceArray.push(fenceArray);
            //     });
            // }
        }
        modifiedResponse = {
            geoFence,
            ...beneficiaryDetails,
            mapHistory: mapResponseArray
        };
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_LOCATION_EXISTS_FOR_GIVEN_ID, 'EN_US', []);
    }
    return finalResponse;
};

module.exports = {
    beneficiaryTrackMapBusiness,
    getBeneficiaryMapHistoryBusiness
};
