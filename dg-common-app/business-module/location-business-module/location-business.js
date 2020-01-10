const {arrayNotEmptyCheck, notNullCheck, objectHasPropertyCheck} = require('../../util-module/data-validators');
const deviceAccessor = require('../../repository-module/data-accesors/device-accesor');
const containerAccessor = require('../../repository-module/data-accesors/container-accessor');
const cronJob = require('cron').CronJob;
const {notificationEmailBusiness} = require('../../business-module/common-business-module/common-business');
const eLockSessionBusiness = require('../e-lock-business-module/e-lock-session-business');

//To insert dumped data to actual collections(elocksLocation & elocksDeviceAttributes)  & delete the dump from elocksDumpData
const newJob = new cronJob('* 2 * * *', async () => {
    // console.log('cron Job started');
    await $eLocksDataDumpToMasterCronJobBusiness();
});

const dataSplitter = async (data, locationPrimaryId, elockDeviceAttributeId, socketAddress) => {
    let deviceIMEIId, datalength, containerId, deviceId, deviceAlertInfo, deviceType, protocol, dataType,
        deviceUpdatedDate,
        returnString = '',
        currentSocketAddress = null,
        location = null, response = null,
        deviceAttributes = null;
    deviceAlertInfo = hexToBinary(data.slice(72, 76));
    deviceIMEIId = parseInt(data.slice(2, 12), 10);//device Id
    protocol = data.slice(12, 14);// 17 being the protocol
    deviceType = data.slice(14, 15);// 1 being rechargeable
    dataType = data.slice(15, 16);// data type - 1-real time,2- alarm,3-history
    datalength = data.slice(16, 20);
    let processedLoc = {
        latitude: degreeConverter(data.slice(32, 40), hexToBinary(data.slice(49, 50))),
        longitude: degreeConverter(data.slice(40, 49), hexToBinary(data.slice(49, 50)))
    };
    if (processedLoc.longitude.loc !== 0 && processedLoc.latitude.loc !== 0) {
        deviceUpdatedDate = new Date(parseInt(`20${data.slice(24, 26)}`, 10), (parseInt(data.slice(22, 24)) - 1), data.slice(20, 22), data.slice(26, 28), data.slice(28, 30), data.slice(30, 32));// date
        const containerResponse = await deviceAccessor.getContainerIdByImeiAccessor({
            deviceIMEIId,
            deviceUpdatedDate
        });
        if (notNullCheck(containerResponse) && notNullCheck(containerResponse[0].trips) && notNullCheck(containerResponse[0].trips.tripId)) {
            await eLockSessionBusiness.insertELockSessionBusiness(socketAddress, deviceIMEIId);
            currentSocketAddress = socketAddress;
            let latArray = containerResponse[0]['trips']['latArray'];
            let lngArray = containerResponse[0]['trips']['lngArray'];
            latArray = latArray ? latArray.sort() : [];
            lngArray = lngArray ? lngArray.sort() : [];

            if (processedLoc.latitude.loc > latArray[latArray.length - 1] || processedLoc.latitude.loc < latArray[0] || processedLoc.longitude.loc > lngArray[latArray.length - 1] || processedLoc.longitude.loc < lngArray[0]) {
                setTimeout(() => {
                    notificationEmailBusiness(containerResponse[0]['trips']['notificationEmail1'], 'geo_fence', containerResponse[0]);
                    setTimeout(() => {
                        notificationEmailBusiness(containerResponse[0]['trips']['notificationEmail2'], 'geo_fence', containerResponse[0]);
                    }, 400);
                    setTimeout(() => {
                        notificationEmailBusiness(containerResponse[0]['trips']['notificationEmail3'], 'geo_fence', containerResponse[0]);
                    }, 800);
                }, 20000);
            }
            containerId = containerResponse[0]['containerId'];
            deviceId = containerResponse[0]['_id'];
            location = {
                containerId: containerId,
                tripId: containerResponse[0]['trips']['tripId'],
                deviceId: deviceId,
                // TODO add speed logic
                // speed: data.slice(50, 52),
                _id: locationPrimaryId,
                deviceDate: deviceUpdatedDate,
                latitude: processedLoc.latitude.loc,
                latitudeDirection: processedLoc.latitude.locCode,
                longitude: processedLoc.longitude.loc,
                longitudeDirection: processedLoc.longitude.locCode
            };
            deviceAttributes = {
                containerId: containerId,
                deviceId: deviceId,
                _id: elockDeviceAttributeId,
                locationId: locationPrimaryId,
                tripId: containerResponse[0]['trips']['tripId'],
                gps: data.slice(49, 50),
                speed: notNullCheck(data.slice(50, 52)) ? hexDecimalConverter(data.slice(50, 52)) * 1.85 : 0,// multiply by 1.85 to convert to km from sea mile
                direction: notNullCheck(data.slice(52, 54)) ? hexDecimalConverter(data.slice(52, 54)) * 2 : 0,
                mileage: notNullCheck(data.slice(54, 62)) ? hexDecimalConverter(data.slice(54, 62)) : 0,
                gpsQuality: data.slice(62, 64),
                vehicleId: data.slice(64, 72),
                deviceStatus: deviceAlertInfo.returnValue,
                serverDate: new Date(),
                deviceUpdatedDate: deviceUpdatedDate,
                batteryPercentage: eLockBatteryPercentCalculator(data.slice(76, 78)),
                cellId: data.slice(78, 82),
                lac: data.slice(82, 86),
                gsmQuality: data.slice(86, 88),
                geoFenceAlarm: data.slice(88, 90)
            };
            if (deviceAlertInfo.flag && deviceAlertInfo.returnValue && deviceAlertInfo.returnValue.split('')[14] === '1') {
                returnString = '(P35)';
            }
            response = {};
            response['deviceId'] = deviceId;
            response['containerId'] = containerId;
            response['location'] = location;
            response['deviceAttributes'] = deviceAttributes;
            response['returnString'] = returnString;
            response['socketAddress'] = currentSocketAddress;
        }
    }
    return response;
};

const eLockBatteryPercentCalculator = (hexValue) => {
    let batteryPercent = 0, decimalValue;
    decimalValue = parseInt(hexValue, 16);
    // decimalValue !== 255 &&
    if (decimalValue > 100) {
        batteryPercent = 100;
    } else {
        batteryPercent = decimalValue;
    }
    return batteryPercent;
};
const eLocksDataUpdateBusiness = async (eLockData) => {
    let returnString = '', updateLoc, deviceId, containerId, updateDevice, returnArray, locationList = [],
        deviceAttributesList = [], masterData = {},
        dataSplitterResponse = null;
    const eLockStatus = eLockData.data.slice(0, 2);
    switch (parseInt(eLockStatus, 10)) {
        case 24:
            returnArray = await dataIterator(eLockData.data, null);
            break;
        case 28:
            returnString = '(P46)';
            break;
    }
    // console.log('GPS and alarm data');
    // console.log(returnArray);
    if (objectHasPropertyCheck(returnArray, 'gps') && arrayNotEmptyCheck(returnArray.gps)) {
        const locationPrimaryKeyResponse = await containerAccessor.fetchNextLocationPrimaryKeyAccessor();
        const eLockAttributesPrimaryKeyResponse = await containerAccessor.fetchNextDeviceAttributesPrimaryKeyAccessor();
        let locationPrimaryId = parseInt(locationPrimaryKeyResponse[0]['counter']) + 1;
        let finalLocCount = locationPrimaryId + returnArray.gps.length;
        await containerAccessor.updateNextLocationPrimaryKeyAccessor(finalLocCount + 1);
        let eLockAttributeId = parseInt(eLockAttributesPrimaryKeyResponse[0]['counter']) + 1;
        let finalELockAttrCount = eLockAttributeId + returnArray.gps.length;
        await containerAccessor.updateNextDeviceAttributesPrimaryKeyAccessor(finalELockAttrCount + 1);
        await asyncForEach(returnArray.gps, async (gpsData) => {
            locationPrimaryId++;
            eLockAttributeId++;
            dataSplitterResponse = await dataSplitter(gpsData, locationPrimaryId, eLockAttributeId, eLockData.socketAddress);
            if (notNullCheck(dataSplitterResponse)) {
                if (notNullCheck(dataSplitterResponse['location'])) {
                    locationList.push(dataSplitterResponse['location']);
                }
                masterData = {
                    deviceId: dataSplitterResponse['deviceId'],
                    containerId: dataSplitterResponse['containerId']
                };
                deviceId = deviceId || (dataSplitterResponse ? dataSplitterResponse['deviceId'] : null);
                containerId = containerId || (dataSplitterResponse ? dataSplitterResponse['containerId'] : null);
                returnString = returnString || objectHasPropertyCheck(dataSplitterResponse, 'returnString') ? dataSplitterResponse['returnString'] : null;
                // console.log('data splitter rfesponse');
                // console.log(dataSplitterResponse);
                if (notNullCheck(dataSplitterResponse['deviceAttributes'])) {
                    deviceAttributesList.push(dataSplitterResponse['deviceAttributes']);
                }
            }
        });
        let finalLocationId, finalDeviceAttrId;
        if (arrayNotEmptyCheck(locationList)) {
            finalLocationId = locationList[locationList.length - 1]['_id'];
            updateLoc = await containerAccessor.containerLocationUpdateAccessor(locationList);
        }
        if (arrayNotEmptyCheck(deviceAttributesList)) {
            finalDeviceAttrId = deviceAttributesList[deviceAttributesList.length - 1]['_id'];
            updateDevice = await containerAccessor.containerDeviceAttributesUpdateAccessor(deviceAttributesList);
        }
        masterData = {
            ...masterData,
            locationId: finalLocationId,
            eLockAttributeId: finalDeviceAttrId
        };
    }
    await containerAccessor.updateElocksLocationDeviceAttributeMasterAccessor(masterData);
    newJob.start();
    // console.log(newJob);
    return returnString;
};

const $eLocksDataDumpToMasterCronJobBusiness = async () => {
    let dumpDataResponse, locationList = [], deviceAttributesList = [], sortedDumpIdList = [],
        masterLocationDeviceAttrObj;
    dumpDataResponse = await containerAccessor.getSortedDumpDataAccessor();
    if (arrayNotEmptyCheck(dumpDataResponse)) {
        const locationPrimaryKeyResponse = await containerAccessor.fetchNextLocationPrimaryKeyAccessor();
        const eLockAttributesPrimaryKeyResponse = await containerAccessor.fetchNextDeviceAttributesPrimaryKeyAccessor();
        let locationPrimaryId = parseInt(locationPrimaryKeyResponse[0]['counter']) + 1;
        let eLockAttributeId = parseInt(eLockAttributesPrimaryKeyResponse[0]['counter']) + 1;
        dumpDataResponse.forEach((item) => {
            let locationObj = {
                _id: locationPrimaryId,
                containerId: item['containerId'],
                tripId: item['tripId'],
                deviceId: item['deviceId'],
                deviceDate: item['deviceDate'],
                latitude: item['latitude'],
                latitudeDirection: item['latitudeDirection'],
                longitude: item['longitude'],
                longitudeDirection: item['longitudeDirection'],
            };
            let deviceAttributesObj = {
                _id: eLockAttributeId,
                containerId: item['containerId'],
                deviceId: item['deviceId'],
                tripId: item['tripId'],
                locationId: locationPrimaryId,
                gps: item['gps'],
                speed: item['speed'],
                direction: item['direction'],
                mileage: item['mileage'],
                gpsQuality: item['gpsQuality'],
                vehicleId: item['vehicleId'],
                deviceStatus: item['deviceStatus'],
                serverDate: item['serverDate'],
                deviceUpdatedDate: item['deviceDate'],
                batteryPercentage: item['batteryPercentage'],
                cellId: item['cellId'],
                lac: item['lac'],
                gsmQuality: item['gsmQuality'],
                geoFenceAlarm: item['geoFenceAlarm']
            };
            sortedDumpIdList.push(`ObjectId(${item['_id']})`);
            locationPrimaryId++;
            eLockAttributeId++;
            locationList.push(locationObj);
            deviceAttributesList.push(deviceAttributesObj);
        });
        let latestData = locationList.pop();
        masterLocationDeviceAttrObj = {
            containerId: latestData['containerId'],
            deviceId: latestData['deviceId'],
            locationId: locationPrimaryId,
            deviceAttributeId: eLockAttributeId,
        };
        await containerAccessor.deleteSortedDumpDataAccessor(sortedDumpIdList);
        await containerAccessor.updateNextLocationPrimaryKeyAccessor(locationPrimaryId);
        await containerAccessor.updateNextDeviceAttributesPrimaryKeyAccessor(eLockAttributeId);
        await containerAccessor.updateElocksLocationDeviceAttributeMasterAccessor(masterLocationDeviceAttrObj);
        await containerAccessor.containerLocationUpdateAccessor(locationList);
        await containerAccessor.containerDeviceAttributesUpdateAccessor(deviceAttributesList);
    }
};

const dataSplitterDump = async (data, masterDate) => {
    let deviceIMEIId, datalength, dumpData, containerId, deviceId, deviceAlertInfo, deviceType, protocol, deviceStatus,
        deviceUpdatedDate,
        returnString = '',
        response = {};
    deviceAlertInfo = hexToBinary(data.slice(72, 76));
    deviceIMEIId = data.slice(2, 12);//device Id
    protocol = data.slice(12, 14);// 17 being the protocol
    deviceType = data.slice(14, 15);// 1 being rechargeable
    deviceStatus = data.slice(15, 16);// data type
    datalength = data.slice(16, 20);
    let processedLoc = {
        latitude: degreeConverter(data.slice(32, 40), hexToBinary(data.slice(49, 50))),
        longitude: degreeConverter(data.slice(40, 49), hexToBinary(data.slice(49, 50)))
    };
    if (processedLoc.longitude.loc !== 0 && processedLoc.latitude.loc !== 0) {
        deviceUpdatedDate = new Date(parseInt(`20${data.slice(24, 26)}`, 10), (parseInt(data.slice(22, 24)) - 1), data.slice(20, 22), data.slice(26, 28), data.slice(28, 30), data.slice(30, 32));// date
        if (deviceUpdatedDate > masterDate) {
            const eLockSessionData = await eLockSessionBusiness.getELockSessionBusiness(deviceIMEIId);
            // console.log(eLockSessionData);
            if (!eLockSessionData) {
                await eLockSessionBusiness.insertELockSessionBusiness(eLockData.socketAddress, deviceIMEIId);
            }
            const containerResponse = await deviceAccessor.getContainerIdByImeiAccessor(parseInt(deviceIMEIId, 10));
            if (arrayNotEmptyCheck(containerResponse)) {
                containerId = containerResponse[0]['containerId'];
                deviceId = containerResponse[0]['_id'];
                dumpData = {
                    containerId: containerId,
                    deviceId: deviceId,
                    deviceDate: deviceUpdatedDate,
                    latitude: processedLoc.latitude.loc,
                    latitudeDirection: processedLoc.latitude.locCode,
                    longitude: processedLoc.longitude.loc,
                    longitudeDirection: processedLoc.longitude.locCode,
                    gps: data.slice(49, 50),
                    tripId: containerResponse[0]['trips']['tripId'],
                    speed: data.slice(50, 52),
                    direction: data.slice(52, 54),
                    mileage: data.slice(54, 62),
                    gpsQuality: data.slice(62, 64),
                    vehicleId: data.slice(64, 72),
                    deviceStatus: deviceAlertInfo.returnValue,
                    serverDate: new Date(),
                    deviceUpdatedDate: deviceUpdatedDate,
                    batteryPercentage: eLockBatteryPercentCalculator(data.slice(76, 78)),
                    cellId: data.slice(78, 82),
                    lac: data.slice(82, 86),
                    gsmQuality: data.slice(86, 88),
                    geoFenceAlarm: data.slice(88, 90)
                };
                if (deviceAlertInfo.flag && deviceAlertInfo.returnValue && deviceAlertInfo.returnValue.split('')[14] === '1') {
                    returnString = '(P35)';
                }
                response['deviceId'] = deviceId;
                response['containerId'] = containerId;
                response['returnString'] = returnString;
                response['dumpData'] = dumpData;
            }
        }
    }
    return response;
};
//This method is used to insert elocks data obtained from device into elocksDumpData collection
// and updating elocksMasterDump collection with the latest dump date
const eLocksDataUpdateDumpBusiness = async (data) => {
    let returnString = '', updateLoc, deviceId, containerId, updateDevice, returnArray,
        dumpDataList = [], masterDateResponse = {}, masterDate,
        dataSplitterResponse = null, response;
    const eLockStatus = data.slice(0, 2);
    // console.log('elock Status');
    // console.log(eLockStatus);
    switch (parseInt(eLockStatus, 10)) {
        case 24:
            returnArray = await dataIterator(data, null);
            break;
        case 28:
            returnString = '(P46)';
            break;
    }
    if (objectHasPropertyCheck(returnArray, 'gps') && arrayNotEmptyCheck(returnArray.gps)) {
        masterDateResponse = await containerAccessor.getMasterDumpDateAccessor();
        masterDate = arrayNotEmptyCheck(masterDateResponse) ? masterDateResponse[0]['masterDate'] : null;
        await asyncForEach(returnArray.gps, async (data) => {
            dataSplitterResponse = await dataSplitterDump(data, masterDate);
            returnString = returnString || objectHasPropertyCheck(dataSplitterResponse, 'returnString') ? dataSplitterResponse['returnString'] : null;
            if (notNullCheck(dataSplitterResponse['dumpData'])) {
                dumpDataList.push(dataSplitterResponse['dumpData']);
            }
        });
        if (arrayNotEmptyCheck(dumpDataList)) {
            containerAccessor.insertElocksDumpDataAccessor(dumpDataList);
            containerAccessor.updateMasterDumpDateAccessor('dumpDate', dumpDataList.pop()['deviceDate']);
        }
    }
    // console.log('+++++++++++++++++++++return string++++++++++++++++++++++++');
    // console.log(returnString);
    return returnString;
};

const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
};

const degreeConverter = (minuteData, direction) => {
    let degree, minute, total, loc, locCode;
    if (minuteData.length === 8) {
        degree = parseInt(minuteData.slice(0, 2));
        minute = (parseFloat('' + minuteData.slice(2, 4) + '.' + minuteData.slice(4, 8))) / 60;
        total = degree + minute;
        if (direction.toString() === '1111' || direction.toString() === '1110') {
            loc = total;
            locCode = 'W';
        } else {
            loc = direction[1] === 1 ? -1 * total : total;
            locCode = direction[1] === 1 ? 'E' : 'W';
        }
    } else {
        degree = parseInt(minuteData.slice(0, 3));
        minute = (parseFloat('' + minuteData.slice(3, 5) + '.' + minuteData.slice(5, 9))) / 60;
        total = degree + minute;
        if (direction.toString() === '1111' || direction.toString() === '1110') {
            loc = total;
            locCode = 'N';
        } else {
            loc = direction[2] === 1 ? total : -1 * total;
            locCode = direction[2] === 1 ? 'N' : 'S';
        }
    }
    return {loc, locCode};
};

const dataIterator = (data, obj) => {
    data = typeof data === 'string' ? data.split('') : data;
    if (!obj) {
        obj = {
            gps: [],
            alarm: [],
            others: []
        }
    }
    if (data.length > 0) {
        switch (parseInt(data.slice(0, 2).join(''))) {
            case 24:
                obj.gps.push(data.splice(0, 98).join(''));
                break;
            case 28:
                obj.alarm.push(data.splice(0, 32).join(''));
                break;
            default:
        }
        if (data.length > 0) {
            return dataIterator(data, obj);
        } else {
            return obj;
        }
    }
    return obj;
};

const hexToBinary = (deviceStatus) => {
    let ret = '', returnValue = {flag: false, returnArray: ''},
        lookupTable = {
            '0': '0000', '1': '0001', '2': '0010', '3': '0011', '4': '0100',
            '5': '0101', '6': '0110', '7': '0111', '8': '1000', '9': '1001',
            'a': '1010', 'b': '1011', 'c': '1100', 'd': '1101',
            'e': '1110', 'f': '1111',
            'A': '1010', 'B': '1011', 'C': '1100', 'D': '1101',
            'E': '1110', 'F': '1111'
        };
    // lookup table for easier conversion. '0' characters are padded for '1' to '7'
    for (let i = 0; i < deviceStatus.length; i += 1) {
        if (lookupTable.hasOwnProperty(deviceStatus[i])) {
            ret += lookupTable[deviceStatus[i]];
        }
    }
    returnValue.flag = ret.length === 16;
    returnValue.returnArray = ret;
    return returnValue;
};

const binaryToDecimalConverter = (binary) => {
    return parseInt(binary, 2);
};

const hexDecimalConverter = (hex) => {
    return parseInt(hex, 16);
};

module.exports = {
    eLocksDataUpdateBusiness,
    eLocksDataUpdateDumpBusiness
};
