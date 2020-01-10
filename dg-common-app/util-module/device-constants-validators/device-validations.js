const {DEVICE_ATTRIBUTE_CONSTANTS} = require('./device-attribute-constants');
const {notNullCheck, objectHasPropertyCheck} = require('../data-validators');
const deviceValidator = (deviceAttributes, beneficiaryId, location) => {
    let validationObj = {}, validationResponse;
    Object.keys(deviceAttributes).forEach((key) => {
        switch (key) {
            case DEVICE_ATTRIBUTE_CONSTANTS.BATTERY_PERCENTAGE: {
                validationObj[DEVICE_ATTRIBUTE_CONSTANTS.BATTERY_PERCENTAGE] = batteryValidator(deviceAttributes[key]);
                break;
            }
            case DEVICE_ATTRIBUTE_CONSTANTS.GSM_ALARM: {
                validationObj[DEVICE_ATTRIBUTE_CONSTANTS.GSM_ALARM] = gsmValidator(deviceAttributes[key]);
                break;
            }
            case DEVICE_ATTRIBUTE_CONSTANTS.BELT_ALARM: {
                validationObj[DEVICE_ATTRIBUTE_CONSTANTS.BELT_ALARM] = alarmValidator(deviceAttributes[key]);
                break;
            }
            case DEVICE_ATTRIBUTE_CONSTANTS.SHELL_ALARM: {
                validationObj[DEVICE_ATTRIBUTE_CONSTANTS.SHELL_ALARM] = alarmValidator(deviceAttributes[key]);
                break;
            }
            // case DEVICE_ATTRIBUTE_CONSTANTS.HOUSE_ARREST_ALARM:{
            //     validationObj[DEVICE_ATTRIBUTE_CONSTANTS.HOUSE_ARREST_ALARM] = geofenceValidator(deviceAttributes[key],location,beneficiaryId);
            //     break;
            // }
        }
    });
    if (notNullCheck(validationObj) && validationObj !== {}) {
        if (objectHasPropertyCheck(validationObj, DEVICE_ATTRIBUTE_CONSTANTS.BATTERY_VOLTAGE)) {
            validationResponse = {
                alertType: 'battery-alert',
                ticketName: 'AUTOMATED ALERT:LOW BATTERY',
                ticketDescription: 'Battery is below 10%'
            };
        } else if (objectHasPropertyCheck(validationObj, DEVICE_ATTRIBUTE_CONSTANTS.SHELL_ALARM)) {
            validationResponse = {
                alertType: 'shell-alert',
                ticketName: 'AUTOMATED ALERT:SHELL BREAK',
                ticketDescription: 'Shell has been broken'
            };
        } else if (objectHasPropertyCheck(validationObj, DEVICE_ATTRIBUTE_CONSTANTS.BELT_ALARM)) {
            validationResponse = {
                alertType: 'belt-alert',
                ticketName: 'AUTOMATED ALERT:BELT CUT',
                ticketDescription: 'Belt has been cut'
            };
        }
    }
    return validationResponse;
};

const batteryValidator = (batteryVoltage) => {
    return parseFloat(batteryVoltage) < 10;
};

const gsmValidator = (gsmLevel) => {
    return parseInt(gsmLevel,10) <= 1;
};

const geofenceValidator = () => {

};

const alarmValidator = (alarmStatus) => {
    return parseInt(alarmStatus,10) === 1;
};

module.exports = {
    deviceValidator
};