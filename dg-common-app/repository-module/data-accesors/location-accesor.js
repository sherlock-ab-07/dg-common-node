const {getBeneficiaryMapHistoryQuery,getBeneficiaryLocationList, selectAllCountriesForGlobalAdminQuery, locationCounterQuery, locationDetailsUpdateQuery,getCountryCodeByLocationIdQuery, selectCenterIdsForLoggedInUserAndSubUsersQuery, selectCenterIdsForGivenUserIdQuery, selectCountryForSuperAdminQuery, selectAllCountriesForMasterAdminQuery, selectCountryForSupervisorAndAdminQuery} = require('../queries/location-query');
const {connectionCheckAndQueryExec} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const {requestInModifier} = require('../../util-module/request-transformers');

const mapMarkerQuery = async (req) => {
    let returnObj;
    returnObj = await getBeneficiaryLocationList(req);
    return returnObj;
};

const getCountryCodeByLocationIdAccessor = async(locationId)=>{
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(locationId, getCountryCodeByLocationIdQuery);
    return returnObj;
};

const getBeneficiaryMapHistoryAccessor = async (req) => {
    let returnObj;
    returnObj = await getBeneficiaryMapHistoryQuery(req);
    return returnObj;
};

const updateLocation = async (req) => {
    let counterResponse = await locationCounterQuery(), locationId;
    locationId = counterResponse['_doc']['counter'];
    let obj = {
        _id: locationId, ...req
    };
    await locationDetailsUpdateQuery(obj);
    return counterResponse;
};

const getCenterIdsForLoggedInUserAndSubUsersAccessor = async (req) => {
    let returnObj, modifiedQuery;
    modifiedQuery = requestInModifier(req, selectCenterIdsForLoggedInUserAndSubUsersQuery, false);
    returnObj = await connectionCheckAndQueryExec(req, modifiedQuery);
    return returnObj;
};
const getCenterIdsAccessor = async (req) => {
    let returnObj;
    returnObj = await connectionCheckAndQueryExec(req, selectCenterIdsForGivenUserIdQuery);
    return returnObj;
};
const getCountryListAccessor = async (req) => {
    let countryListResponse, request = [req.userId, req.languageId], masterGlobalAdminRequest = [req.languageId];
    switch (req.userRole) {
        case 'ROLE_SUPERVISOR':
        case 'ROLE_ELOCKS_OPERATOR':
        case 'ROLE_ADMIN': {
            countryListResponse = await connectionCheckAndQueryExec(request, selectCountryForSupervisorAndAdminQuery);
            break;
        }
        case 'ROLE_E_LOCK_ADMIN':    
        case 'ROLE_SUPER_ADMIN' : {
            countryListResponse = await connectionCheckAndQueryExec(request, selectCountryForSuperAdminQuery);
            break;
        }
        case 'ROLE_MASTER_ADMIN' : {
            countryListResponse = await connectionCheckAndQueryExec(masterGlobalAdminRequest, selectAllCountriesForMasterAdminQuery);
            break;
        }
        case 'ROLE_GLOBAL_ADMIN' : {
            countryListResponse = await connectionCheckAndQueryExec(masterGlobalAdminRequest, selectAllCountriesForGlobalAdminQuery);
        }
    }
    return countryListResponse;
};

module.exports = {
    getCountryListAccessor,
    getCenterIdsAccessor,
    updateLocation,
    getCountryCodeByLocationIdAccessor,
    getBeneficiaryMapHistoryAccessor,
    getCenterIdsForLoggedInUserAndSubUsersAccessor
};
