const deviceCommandConstants = {

//Connection Commands
//(Tracker -> Server)
    cmdLogin: "#SA",
//(Server- > Tracker)
    cmdLoginResponse: "#SB",
//(Tracker -> Server)
    cmdLogout: "#SC",
//(Tracker -> Server)
    cmdCheckConnection: "#SE",
//(Tracker -> Server)
    cmdOperatorAndAPN: "#SI",

//Positioning Commands
//(Server- > Tracker)
    cmdIntervalTimeSetting: "#RC",
//(Tracker -> Server)
    cmdLocationReport: "#RD",
    cmdLocationResponse: "#RE",

//Other Commands
//(Server- > Tracker)
    cmdSMSPasswordAndSOSPhone: "#OC",
//(Tracker -> Server)
    cmdSMSPasswordAndSOSPhoneResponse: "#OD",
//(Server- > Tracker)
    cmdChangeIPaddressAndPort: "#OY",
//(Tracker -> Server)
    cmdChangeIPaddressAndPortResponse: "#OZ",
//(Server- > Tracker)
    cmdDeviceSettingParameter: "#XA",
//(Tracker -> Server)
    cmdDeviceSettingParameterResponse: "#XB",
//0N000000000000000000
    deviceParameters: "00000" + "000000000000000",
//102338210001000000000
    deviceAlarms: "000000000000000000000"
};
module.exports = {
    deviceCommandConstants
};
