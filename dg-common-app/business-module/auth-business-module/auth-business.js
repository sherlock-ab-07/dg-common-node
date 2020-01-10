const crypto = require('crypto-js');// this library is used to encrypt and decrypt password and email while transferring over the network
const bcrypt = require('bcryptjs');// this library is used to generate the hash password
const jwt = require('jsonwebtoken');// This method is used to implement the auth token to be ping ponged back and forth for the request authentication.
const {statusCodeConstants} = require('../../util-module/response-status-constants/status-code-constants');
const {emoji} = require('../../util-module/custom-request-reponse-modifiers/encoder-decoder-constants');
const {objectHasPropertyCheck, arrayNotEmptyCheck, responseObjectCreator} = require('../../util-module/data-validators');
const {fennixResponse} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const {checkUserEmailId, authenticateBeneficiaryDetails, authenticateUserDetails, checkBenificiaryEmailId} = require('../../repository-module/data-accesors/auth-accesor');
const {fetchUserDetailsBusiness, userResetPasswordBusiness} = require('../user-business-module/user-business');
const {forgotPasswordemailBusiness} = require('../common-business-module/common-business');

const checkEmailId = async (req) => {
    let responseObj, businessResponse;
    businessResponse = await checkUserEmailId([req.query.userMailId]);
    if (objectHasPropertyCheck(businessResponse, 'rows') && arrayNotEmptyCheck(businessResponse.rows)) {
        responseObj = fennixResponse(statusCodeConstants.STATUS_EMAIL_PRESENT, 'EN_US', businessResponse.rows[0]);
    } else {
        businessResponse = checkBenificiaryEmailId(req.query.email);
        if (objectHasPropertyCheck(businessResponse, 'rows') && arrayNotEmptyCheck(businessResponse.rows)) {
            responseObj = fennixResponse(statusCodeConstants.STATUS_EMAIL_PRESENT, 'EN_US', businessResponse.rows[0]);
        } else {
            responseObj = fennixResponse(statusCodeConstants.STATUS_EMAIL_NOT_PRESENT, 'EN_US', []);
        }
    }
    return responseObj;
};

const fetchLoginProfileBusiness = async (req) => {
    let loginProfileResponse;
    loginProfileResponse = await fetchUserDetailsBusiness(req);
    return loginProfileResponse;
};
/**
 * @description This method is used to authenticate the user.We will be receiving encrypted email and password from the login and from that we decrypt it.
 * After decrypting we fetch the user based on email.We do a is active check via the retire check function.
 * After this check is done we compare the decrypted password with the Hashed password from DB using *****bcrypt.compare*****
 *@summary bcrypt is used to hash the password.So bcrypt will again be used to compare them as well.
 * @param req
 * @return {Promise<{response: null, header: null}>}
 */
const authenticateUser = async (req) => {
    let businessResponse, authResponse, returnResponse = {response: null, header: null};
    const algo = emoji[req.body.avatar]['encoding'];
    const passKey = emoji[req.body.avatar]['secretPass'];
    const request = [
        decrypt(algo, passKey, req.body.email),
        req.body.language
    ];
    businessResponse = await authenticateUserDetails(request);
    if (objectHasPropertyCheck(businessResponse, 'rows') && arrayNotEmptyCheck(businessResponse.rows)) {
        authResponse = await bcrypt.compare(decrypt(algo, passKey, req.body.password), businessResponse.rows[0].password);
        if (authResponse) {
            returnResponse = verifiedLoginReducer(businessResponse.rows[0]);
        } else {
            returnResponse = incorrectPasswordReducer(fennixResponse(statusCodeConstants.STATUS_PASSWORD_INCORRECT, 'EN_US', []));
        }
    } else {
        businessResponse = await authenticateBeneficiaryDetails(request);
        if (objectHasPropertyCheck(businessResponse, 'rows') && arrayNotEmptyCheck(businessResponse.rows)) {
            authResponse = await bcrypt.compare(decrypt(algo, passKey, req.body.password), businessResponse.rows[0].password);
            if (authResponse) {
                returnResponse = verifiedLoginReducer(businessResponse.rows[0]);
            } else {
                returnResponse = incorrectPasswordReducer(fennixResponse(statusCodeConstants.STATUS_PASSWORD_INCORRECT, 'EN_US', []));
            }
        } else {
            returnResponse = incorrectPasswordReducer(fennixResponse(statusCodeConstants.STATUS_PASSWORD_INCORRECT, 'EN_US', []));
        }
    }
    return returnResponse;
};

const incorrectPasswordReducer = (response) => {
    return {
        header:null,
        response
    }
};
/**
 * this is a private method to create the response for a verified logged in user.
 * @param authResponse
 * @return {{response: *, header: null}}
 */
const verifiedLoginReducer = (authResponse) => {
    let responseObj = authResponseObjectFormation(authResponse),retireCheckFlag = retireCheck(responseObj);
    responseObj = responseFormation(responseObj, retireCheckFlag);
    return {
    header : retireCheckFlag ? jwt.sign(responseObj, 'SOFIA-Fennix Global') : null,
    response : responseObj
    }
};

/**
 * @description When the user clicks on forgot password link in login page he is navigated to the forgot password page.
 * There he enters the email and based on the email we validate and send out a forgot password link.
 * @param req
 * @return {Promise<{}|*|{}>}
 */

const forgotPasswordBusiness = async (req) => {
    let responseObj, businessResponse, retireCheckFlag, returnResponse = '';
    const algo = emoji[req.body.avatar]['encoding'];
    const passKey = emoji[req.body.avatar]['secretPass'];
    const emailId = decrypt(algo, passKey, req.body.email);
    const request = [
        decrypt(algo, passKey, req.body.email),
        req.body.language
    ];
    businessResponse = await authenticateUserDetails(request);
    if (objectHasPropertyCheck(businessResponse, 'rows') && arrayNotEmptyCheck(businessResponse.rows)) {
        retireCheckFlag = retireCheck(businessResponse.rows[0]);
        responseObj = responseFormation(businessResponse.rows[0], retireCheckFlag);
        if (retireCheckFlag) {
            forgotPasswordemailBusiness(emailId, `${businessResponse.rows[0]['first_name']} ${businessResponse.rows[0]['last_name']}`, businessResponse.rows[0]['user_role']);
        }
        returnResponse = responseObj;
    } else {
        businessResponse = await authenticateBeneficiaryDetails(request);
        if (objectHasPropertyCheck(businessResponse, 'rows') && arrayNotEmptyCheck(businessResponse.rows)) {
            responseObj = authResponseObjectFormation(businessResponse.rows[0]);
            retireCheckFlag = retireCheck(responseObj);
            responseObj = responseFormation(businessResponse.rows[0], retireCheckFlag);
            if (retireCheckFlag) {
                forgotPasswordemailBusiness(emailId, `${businessResponse.rows[0]['first_name']} ${businessResponse.rows[0]['last_name']}`, businessResponse.rows[0]['user_role']);
            }
            returnResponse = responseObj;
        } else {
            returnResponse = fennixResponse(statusCodeConstants.STATUS_NO_USER_FOR_ID, 'EN_US', []);
        }

    }
    return returnResponse;
};

/**
 * @description This method is called when a user clicks on the forgot password link and the user enters the password and the reset password.
 * We recieve the passwords and do a comparision if the passwords do match or not.If they dont we dont allow the user to change the password.
 * To check if the passwords match or not we decrypt the password and check if both are same.
 * @if Passwords match then we go ahead and hash the password +++++++15 rounds++++++++ using -------bcrypt.genSalt and bcrypt.hash-------
 * After this process we send the success or failure error message to the UI.
 * @param req
 * @return {Promise<{}|*|*>}
 */
const resetPasswordBusiness = async (req) => {
    let responseObj, hashedPassword, businessResponse, retireCheckFlag, returnResponse = '';
    const algo = emoji[req.body.avatar]['encoding'];
    const passKey = emoji[req.body.avatar]['secretPass'];
    const emailId = decrypt(algo, passKey, req.body.email);
    const password = decrypt(algo, passKey, req.body.password);
    const request = [
        emailId,
        req.body.language
    ];
    await bcrypt.genSalt(15, async (err, salt) => {
        await bcrypt.hash(password, salt, (err, hash) => {
            hashedPassword = hash;
        });
    });
    businessResponse = await authenticateUserDetails(request);
    if (objectHasPropertyCheck(businessResponse, 'rows') && arrayNotEmptyCheck(businessResponse.rows)) {
        retireCheckFlag = retireCheck(businessResponse.rows[0]);
        responseObj = responseFormation(businessResponse.rows[0], retireCheckFlag);
        if (retireCheckFlag) {
            returnResponse = await userResetPasswordBusiness(emailId, hashedPassword);
        } else {
            returnResponse = fennixResponse(statusCodeConstants.STATUS_NO_USER_FOR_ID, 'EN_US', []);
        }
    } else {
        // businessResponse = await authenticateBeneficiaryDetails(request);
        // if (objectHasPropertyCheck(businessResponse, 'rows') && arrayNotEmptyCheck(businessResponse.rows)) {
        //     responseObj = authResponseObjectFormation(businessResponse.rows[0]);
        //     retireCheckFlag = retireCheck(responseObj);
        //     responseObj = responseFormation(businessResponse.rows[0], retireCheckFlag);
        //     returnResponse = responseObj;
        // } else {
        returnResponse = fennixResponse(statusCodeConstants.STATUS_NO_USER_FOR_ID, 'EN_US', []);
        // }

    }
    return returnResponse;
};
/**
 *
 * @param algo - defines the algorithm being used to decrypt.Eg:SHA256,MD5
 * @param passKey - This is the password that we want to decrypt
 * @param message - This is the secret message being sent from the UI via avatar.
 * @return {string}
 */
const decrypt = (algo, passKey, message) => {
    try {
        const decryptedBytes = crypto[algo]['decrypt'](message, passKey);
        return decryptedBytes.toString(crypto.enc.Utf8);
    } catch (e) {
        console.log(e);
    }
};

/**
 *@description This method performs basic isActive check for the given user.
 * @param responseObj
 * @return {*}
 */
const retireCheck = (responseObj) => (responseObj['isactive']);

/**
 * @description this creates the response in the format that the UI expects.
 * @param responseObj
 * @param retireCheck
 * @return {{}|*}
 */
const responseFormation = (responseObj, retireCheck) => {
    return retireCheck ? fennixResponse(statusCodeConstants.STATUS_USER_AUTHENTICATED, 'EN_US', responseObj) : fennixResponse(statusCodeConstants.STATUS_USER_RETIRED, 'EN_US', responseObj)
};

/**
 * @description Tis method creates the authentication object.
 * @param responseObj
 * @return {*}
 */
const authResponseObjectFormation = (responseObj) => {
    return responseObjectCreator(responseObj, ['role_name', 'user_role', 'first_name', 'last_name', 'user_id', 'owner_user_id', 'email_id', 'isactive', 'center_id'], ['role_name', 'user_role', 'first_name', 'last_name', 'user_id', 'owner_user_id', 'email_id', 'isactive', 'center_id']);
};

module.exports = {
    checkEmailId,
    authenticateUser,
    resetPasswordBusiness,
    forgotPasswordBusiness,
    fetchLoginProfileBusiness
};