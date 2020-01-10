const {notNullCheck, arrayNotEmptyCheck, objectHasPropertyCheck, responseObjectCreator} = require('../../util-module/data-validators');
const userAccessors = require('../../repository-module/data-accesors/user-accesor');
const {imageStorageBusiness, emailSendBusiness} = require('../common-business-module/common-business');
const {fennixResponse, dropdownCreator} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const STATUS_CODE_CONSTANTS = require('../../util-module/response-status-constants/status-code-constants');
const COMMON_CONSTANTS = require('../../util-module/util-constants/fennix-common-constants');
const {excelRowsCreator, excelColCreator} = require('../../util-module/request-transformers');
const bcrypt =require('bcryptjs');

const fetchUserDetailsBusiness = async (req) => {
    let request = [req.query.userId, req.query.languageId], userProfileResponse, returnObj;
    userProfileResponse = await userAccessors.fetchUserProfileAccessor(request);
    if (objectHasPropertyCheck(userProfileResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(userProfileResponse.rows)) {
        let userProfileReturnObj = {};
        userProfileResponse.rows.forEach((item) => {
            userProfileReturnObj = {
                userName: `${item['first_name']} ${item['last_name']}`,
                locationId: item['location_id'],
                mobileNo: item['mobile_no'],
                emailId: item['emailid'],
                center: item['center_name'],
                gender: item['gender'],
                image: item['image'],
                role: item['role'],
                userRole: item['role_name'],
                address: item['address'],
            };
        });
        returnObj = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_OK, 'EN_US', userProfileReturnObj);
    } else {
        returnObj = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_USER_RETIRED, 'EN_US', []);
    }
    return returnObj;
};

//TODO write the logic for this
const updateUserProfileBusiness = async (req) => {
    let request = [req.body.userId], userProfileResponse, returnObj;
    userProfileResponse = await userAccessors.updateUserProfileAccessor(request);
    if (notNullCheck(userProfileResponse) && arrayNotEmptyCheck(userProfileResponse)) {
        let ticketObj = {};
        userProfileResponse.forEach((item) => {
            ticketObj[item['_id']] = item['count'];
        });
        returnObj = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_OK, 'EN_US', ticketObj);
    } else {
        returnObj = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_USER_RETIRED, 'EN_US', []);
    }
    return returnObj;
};

const getUserListBusiness = async (req) => {
    let request = [req.query.userId, req.query.languageId, req.query.skip, req.query.limit], userProfileResponse,
        modifiedResponse = [],
        returnObj, totalRecordsResponse, finalResponse = {};
    userProfileResponse = await userAccessors.getUserListAccessor(req);
    totalRecordsResponse = await userAccessors.getTotalRecordsForListUsersAccessor(req);
    finalResponse[COMMON_CONSTANTS.FENNIX_TOTAL_NUMBER_OF_RECORDS] = totalRecordsResponse.rows[0]['count'];
    if (objectHasPropertyCheck(userProfileResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(userProfileResponse.rows)) {
        userProfileResponse.rows.forEach((item) => {
            const obj = {
                userId: item['user_id'],
                roleId: item['role_id'],
                center: objectHasPropertyCheck(item, 'center') ? item['center'] : 'Center is not assigned',
                role: objectHasPropertyCheck(item, 'role') ? item['role'] : 'Role is not assigned',
                mobileNo: objectHasPropertyCheck(item, 'mobile_no') ? item['mobile_no'] : '-',
                email: objectHasPropertyCheck(item, 'email_id') ? item['email_id'] : '-',
                fullName: objectHasPropertyCheck(item, 'full_name') ? item['full_name'] : '-',
                image: item['image']
            };
            modifiedResponse.push(obj);
        });
        finalResponse['gridData'] = modifiedResponse;
        returnObj = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_OK, 'EN_US', finalResponse);
    } else {
        returnObj = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_USER_RETIRED, 'EN_US', []);
    }
    return returnObj;
};
const listOperatorsBusiness = async (req) => {
    let response, returnObj, finalResponse = {dropdownList: []};
    response = await userAccessors.getUserIdsForAllRolesAccessor(req, COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID_NAME);
    if (arrayNotEmptyCheck(response)) {
        response.forEach((item) => {
            finalResponse.dropdownList.push(dropdownCreator(item['userId'], item['name'], false));
        });
        returnObj = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_OK, 'EN_US', finalResponse);
    } else {
        returnObj = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_USER_RETIRED, 'EN_US', []);
    }
    return returnObj;
};

const addUserBusiness = async (req) => {
    let request = req.body;
    if (request.image) {
        request.image = await imageStorageBusiness(request.image, 'USER');
    }
    request.updated_date = new Date();
    request.created_date = new Date();
    request.isActive = true;
    request.first_time_login = true;
    // request.password = bcry;
    await userAccessors.addUserAccessor(request);
    emailSendBusiness(request.emailId, request.role, `${request.firstName} ${request.lastName}`);
    return fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_OK, 'EN_US', []);
};

const updateUserBusiness = async (req) => {
    let response, finalResponse;
    response = await userAccessors.updateUserAccessor(req.body);
    if (notNullCheck(response) && response['rowCount'] != 0) {
        finalResponse = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_OK, 'EN_US', 'Updated user data successfully');
    } else {
        finalResponse = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_NO_USER_FOR_ID)
    }
    return finalResponse;
};

const deleteUserBusiness = async (req) => {
    let response, finalResponse, request = {userId: req.query.userId, isActive: false};
    response = await userAccessors.updateUserAccessor(request);
    if (notNullCheck(response) && response['rowCount'] != 0) {
        finalResponse = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_OK, 'EN_US', 'Deleted user data successfully');
    } else {
        finalResponse = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_NO_USER_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};

const downloadUsersListBusiness = async (req) => {
    let request = [req.query.userId, req.query.languageId], userListResponse, colsKeysResponse, rowsIdsResponse,
        workbook = new Excel.Workbook(), modifiedResponse, keysArray, returnObj = {},
        sheet = workbook.addWorksheet('Beneficiary Sheet');
    colsKeysResponse = await excelColCreator([req.query.filterId]);
    sheet.columns = colsKeysResponse['cols'];
    keysArray = colsKeysResponse['keysArray'];
    userListResponse = await userAccessors.getUserListAccessor(request);
    rowsIdsResponse = excelRowsCreator(userListResponse, 'users', keysArray);
    returnObj = rowsIdsResponse[COMMON_CONSTANTS.FENNIX_ROWS];
    modifiedResponse = Object.keys(returnObj).map(key => returnObj[key]);
    sheet.addRows(modifiedResponse);
    return workbook.xlsx.writeFile('/home/sindhura.gudarada/Downloads/users.xlsx');
};

const listClientsByCompanyIdBusiness = async (req) => {
    let request = {roleName: 'ROLE_CLIENT', companyIdList: [parseInt(req.query.companyId)]}, response,
        modifiedResponse = {gridData: []}, finalResponse;
    response = await userAccessors.listClientsByCompanyIdAccessor(request);
    if (objectHasPropertyCheck(response, 'rows') && arrayNotEmptyCheck(response.rows)) {
        response.rows.forEach((item) => {
            let obj = responseObjectCreator(item, ['userId', 'userName', 'emailId'], ['user_id', 'full_name', 'email_id']);
            modifiedResponse.gridData.push(obj);
        });
        finalResponse = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_NO_CLIENT_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};

const userResetPasswordBusiness = async (emailId, password) => {
    let req = [emailId], response, finalResponse, updateResponse, request;
    response = await userAccessors.getUserByUserEmailIdAccessor(req);
    if (objectHasPropertyCheck(response, 'rows') && arrayNotEmptyCheck(response.rows)) {
        request = {userId: response.rows[0].user_id, password};
        updateResponse = await userAccessors.updateUserAccessor(request);
        if (objectHasPropertyCheck(updateResponse, 'rowCount') && updateResponse.rowCount > 0) {
            finalResponse = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_UPDATE_PASSWORD_SUCCESS, 'EN_US', []);
        } else {
            finalResponse = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_UPDATE_PASSWORD_FAILED, 'EN_US', []);
        }
    } else {
        finalResponse = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_UPDATE_PASSWORD_FAILED, 'EN_US', []);
    }
    return finalResponse;
};

const listUnassignedClientsBusiness = async () => {
    let request = ['ROLE_CLIENT'], response, modifiedResponse = {gridData: []}, finalResponse;
    response = await userAccessors.listUnAssignedClientsAccessor(request);
    if (objectHasPropertyCheck(response, 'rows') && arrayNotEmptyCheck(response.rows)) {
        response.rows.forEach((item) => {
            let obj = responseObjectCreator(item, ['userId', 'userName'], ['user_id', 'full_name']);
            modifiedResponse.gridData.push(obj);
        });
        finalResponse = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_NO_CLIENT_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};

const fetchAllUserDetailsBusiness = async (req) => {
    let request = [req.query.userId, req.query.languageId], userProfileResponse, returnObj;
    userProfileResponse = await userAccessors.fetchUserProfileAccessor(request);
    if (objectHasPropertyCheck(userProfileResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(userProfileResponse.rows)) {
        let userProfileReturnObj;
        let item = userProfileResponse.rows[0];
        userProfileReturnObj = {
            firstName: item['first_name'],
            lastName: item['last_name'],
            country: item['location_id'],
            phoneNo: item['mobile_no'],
            emailId: item['emailid'],
            center: item['center_id'],
            gender: item['gender'],
            userId: item['user_id'],
            image: item['image'],
            role: item['role'],
            address: item['address1'],
        };
        returnObj = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_OK, 'EN_US', userProfileReturnObj);
    } else {
        returnObj = fennixResponse(STATUS_CODE_CONSTANTS.statusCodeConstants.STATUS_USER_RETIRED, 'EN_US', []);
    }
    return returnObj;
};

module.exports = {
    addUserBusiness,
    listClientsByCompanyIdBusiness,
    updateUserProfileBusiness,
    getUserListBusiness,
    fetchUserDetailsBusiness,
    downloadUsersListBusiness,
    updateUserBusiness,
    listUnassignedClientsBusiness,
    deleteUserBusiness,
    userResetPasswordBusiness,
    listOperatorsBusiness,
    fetchAllUserDetailsBusiness
};
