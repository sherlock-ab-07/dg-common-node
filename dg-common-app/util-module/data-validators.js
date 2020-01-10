const {DEVICE_BATTERY_MAP} = require('./device-constants-validators/device-status-constants');

const notNullCheck = (data) => data !== null && data !== undefined && data !== '' && data !== 'undefined' && data !== 'null';
const arrayNotEmptyCheck = (arrayData) => notNullCheck(arrayData) && Object.prototype.toString.call(arrayData) === '[object Array]' && arrayData.length > 0;
const objectHasPropertyCheck = (objectData, propertyName) => notNullCheck(objectData) && objectData.hasOwnProperty(propertyName) && notNullCheck(objectData[propertyName]);

const deviceStatusMapper = (key, value) => {
    let returnValue = {deviceStatus: '', color: ''};
    Object.keys(DEVICE_BATTERY_MAP[key]).map((item) => {
        if (value > DEVICE_BATTERY_MAP[key][item]['startValue'] && value < DEVICE_BATTERY_MAP[key][item]['endValue']) {
            returnValue.deviceStatus = item;
            returnValue.color = DEVICE_BATTERY_MAP[key][item]['color']
        }
    });
    return returnValue;
};


const responseObjectCreator = (inputObject, outputKeyArray, keyArray, excludeEmptyFlag = false) => {
    let returnObject = null;
    if (notNullCheck(inputObject) && arrayNotEmptyCheck(keyArray)) {
        returnObject = {};
        keyArray.forEach((key, index) => {
            if (typeof key === 'string' && !excludeEmptyFlag) {
                returnObject[outputKeyArray[index]] = inputObject[key];
            } else if (arrayNotEmptyCheck(key) && !excludeEmptyFlag) {
                returnObject[outputKeyArray[index]] = arrayObjectReducer(inputObject, key);
            }
        });
    }
    return returnObject;
};

const arrayObjectReducer = (inputData, mappingKeyArray) => {
    if (mappingKeyArray.length === 1) {
        return inputData[mappingKeyArray[0]];
    } else {
        return arrayObjectReducer(inputData[mappingKeyArray[0]], mappingKeyArray.splice(1, mappingKeyArray.length - 1));
    }
};

module.exports = {
    notNullCheck,
    arrayNotEmptyCheck,
    deviceStatusMapper,
    responseObjectCreator,
    objectHasPropertyCheck
};