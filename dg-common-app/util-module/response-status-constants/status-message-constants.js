const statusMessageObjectCreator = (devMessage, userMessage = null) => {
    return {
        devMsg: devMessage, userMsg: {
            EN_US: userMessage || devMessage,
            espMX: userMessage || devMessage,
            espLA: userMessage || devMessage
        }
    }
};
const newSuccessStatusCodeMessages = {

};


const newEmptyStatusCodeMessages = {

};


const newFailureStatusCodeMessages = {

};
const statusCodes = {
    262: statusMessageObjectCreator('company added successfully'),
    263: statusMessageObjectCreator('company edited successfully'),
    265: statusMessageObjectCreator('No container for given id'),
    264: statusMessageObjectCreator('container edited successfully'),
    223: statusMessageObjectCreator('company edit failed'),
    200: statusMessageObjectCreator('OK'),
    250: statusMessageObjectCreator('Beneficiary Added Successfully'),
    251: statusMessageObjectCreator('Beneficiary Edited Successfully'),
    252: statusMessageObjectCreator('Beneficiary Deactivated Successfully'),
    253: statusMessageObjectCreator('Beneficiary Document uploaded Successfully'),
    254: statusMessageObjectCreator('Device added Successfully'),
    255: statusMessageObjectCreator('Sim Card added Successfully'),
    256: statusMessageObjectCreator('Carrier added Successfully'),
    257: statusMessageObjectCreator('Device is now assigned to the Beneficiary'),
    258: statusMessageObjectCreator('Device is now delinked from the Beneficiary and is ready for reassigning'),
    220: statusMessageObjectCreator('no groups available for the given id'),
    207: statusMessageObjectCreator('no cards available for the user'),
    209: statusMessageObjectCreator('no roles available for the given id'),
    210: statusMessageObjectCreator('no filters available for the given id'),
    227: statusMessageObjectCreator('no user available for given id'),
    211: statusMessageObjectCreator('no roles available for the given id'),
    212: statusMessageObjectCreator('no simcards available for the given id'),
    213: statusMessageObjectCreator('no devices available for the given id'),
    600: statusMessageObjectCreator('User email and password Match', 'Logged in Successfully'),
    601: statusMessageObjectCreator('User email present id db', 'User email present'),
    602: statusMessageObjectCreator('User email not present', 'Email is not present.Please ask your admin to add it'),
    603: statusMessageObjectCreator('User is retired', 'Unauthorised entry'),
    604: statusMessageObjectCreator('Email or Password is incorrect'),
    605: statusMessageObjectCreator('Failed to add user', 'Oops!,User is not added.Please try again!'),
    606: statusMessageObjectCreator('Failed to change user password', 'Failed to change password.Please try again'),
    214: statusMessageObjectCreator('no centers available for the given id'),
    216: statusMessageObjectCreator('no countries available for the given id'),
    217: statusMessageObjectCreator('no device types available for the given id'),
    218: statusMessageObjectCreator('no dropdown for this dropdown Id'),
    219: statusMessageObjectCreator('no sim card types available for the given id'),
    221: statusMessageObjectCreator('no carriers available for given id'),
    259: statusMessageObjectCreator('Container Added Successfully'),
    222: statusMessageObjectCreator('no beneficiary available for given id'),
    700: statusMessageObjectCreator('Postgres DB is not getting connected', 'Server is down'),
    240: statusMessageObjectCreator('Device Unlocked successfully'),
    701: statusMessageObjectCreator('mongoDB is not getting connected', 'Server is down'),
    607: statusMessageObjectCreator('no timezone details available for given id'),
    900: statusMessageObjectCreator('Status code is not a number'),
    260: statusMessageObjectCreator('device already exists for given imei'),
    261: statusMessageObjectCreator('no location exists for given id'),
    910: statusMessageObjectCreator('delink of ELock failed'),
    225: statusMessageObjectCreator('no client available for given id'),
    224: statusMessageObjectCreator('no route available for given id'),
    266: statusMessageObjectCreator('Container Deactivated successfully'),
    267: statusMessageObjectCreator('Trip Created successfully.Please navigate to list not started Trip to start the trip'),
    268: statusMessageObjectCreator('No results for the given search'),
    270: statusMessageObjectCreator('Password update successful'),
    271: statusMessageObjectCreator('Password update failed')
};

module.exports = {statusCodes};