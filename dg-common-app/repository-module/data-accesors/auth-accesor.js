const {checkUserEmailQuery, authenticateUser} = require('../queries/user-query');
const {checkBeneficiaryEmailIdQuery,authenticateBeneficiaryQuery} = require('../queries/beneficiary-query');
const {connectionCheckAndQueryExec} = require('../../util-module/custom-request-reponse-modifiers/response-creator');

/**
 * @description - this method is used to check if the user email Id exists in DB
 * @param(req) - The request consists of user email
 * @returns(returnObj) - This consists of a Promise for obtained data
 * **/
const checkUserEmailId = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec( req, checkUserEmailQuery);
    return returnObj;
};
/**
 * @description - this method is used to authenticate the users
 * @param(req) - The request consists of user email and password which is decoded
 * @returns(returnObj) - This consists of a Promise for obtained data
 * **/
const authenticateUserDetails = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec( req, authenticateUser);
    return returnObj;
};

/**
 * @description - this method is used to change password for that particular  user email Id
 * @param(req) - The request consists of user email, old password and new password
 * @returns(returnObj) - This consists of a Promise for obtained data
 * **/
const updateUserPassword = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec( req, updateUserPassword);
    return returnObj;
};

const checkBenificiaryEmailId = async(req)=>{
    let returnObj;
    returnObj = await connectionCheckAndQueryExec( req, checkBeneficiaryEmailIdQuery);
    return returnObj;
};
const authenticateBeneficiaryDetails = async(req)=>{
    let returnObj;
    returnObj = await connectionCheckAndQueryExec( req, authenticateBeneficiaryQuery);
    return returnObj;
};

module.exports = {
    checkUserEmailId,
    updateUserPassword,
    authenticateBeneficiaryDetails,
    authenticateUserDetails,
    checkBenificiaryEmailId
};
