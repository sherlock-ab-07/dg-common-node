const companyAccessors = require('../../repository-module/data-accesors/comapny-accessor');
const routeBusiness = require('../route-business-module/route-business');
const searchBusiness = require('../search-business-module/search-business');
const COMMON_CONSTANTS = require('../../util-module/util-constants/fennix-common-constants');
const {statusCodeConstants} = require('../../util-module/response-status-constants/status-code-constants');
const {fennixResponse, dropdownCreator} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const {getUserIdsForAllRolesAccessor} = require('../../repository-module/data-accesors/user-accesor');
const {objectHasPropertyCheck, arrayNotEmptyCheck, notNullCheck, responseObjectCreator} = require('../../util-module/data-validators');

const addCompanyBusiness = async (req) => {
    let request = req.body, response, routeResponse, finalResponse, noOfRouteRequest, searchRequest = [];
    request.createdDate = new Date();
    request.createdBy = request.userId;
    request.isActive = true;
    response = await companyAccessors.addCompanyAccessor(request);
    if (objectHasPropertyCheck(response, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(response.rows)) {
        request.companyId = response.rows[0]['company_id'];
        if (objectHasPropertyCheck(request, 'companyName') && notNullCheck(request.companyName)) {
            let searchReq = {tag: 'companyName', value: request.companyName};
            await searchBusiness.insertUpdateSearchBusiness(searchReq);
        }
        routeResponse = await routeBusiness.insertCompanyRouteBusiness(request);
        if (notNullCheck(routeResponse)) {
            finalResponse = fennixResponse(statusCodeConstants.STATUS_COMPANY_ADDED_SUCCESS, 'EN_US', []);
            noOfRouteRequest = {companyId: request.companyId, noOfRoutes: request.routes.length};
            await companyAccessors.editCompanyAccessor(noOfRouteRequest);
            //TODO: temp fix. need to capture all other route search details
            if (objectHasPropertyCheck(request, 'routes') && arrayNotEmptyCheck(request.routes)) {
                let originReq = {tag: 'origin', value: request['routes'][0]['startAddress']['name']};
                let destinationReq = {tag: 'destination', value: request['routes'][0]['endAddress']['name']};
                await searchBusiness.insertUpdateSearchBusiness(originReq);
                await searchBusiness.insertUpdateSearchBusiness(destinationReq);
            }
            console.log('added company route successfully');
        } else {
            finalResponse = fennixResponse(statusCodeConstants.STATUS_COMPANY_ADDED_SUCCESS, 'EN_US', []);
            console.log('error while adding company routes');
        }
        if (arrayNotEmptyCheck(searchRequest)) {
            await searchBusiness.insertSearchBusiness(searchRequest);
        }
    }
    return finalResponse;
};

const getObject = (tag, value) => {
    return {tag, value};
};
/*
const listCompanyBusiness = async (req) => {
    let response, finalResponse, modifiedResponse = {gridData: []};
    response = await companyAccessors.listCompanyAccessor([req.query.languageId, req.query.userId, parseInt(req.query.skip), parseInt(req.query.limit)]);
    if (objectHasPropertyCheck(response, 'rows') && arrayNotEmptyCheck(response.rows)) {
        response.rows.forEach((item) => {
            let obj = {
                companyId: item['company_id'],
                companyName: item['company_name'],
                companyType: item['company_type'],
                customsId: item['customs_id']
            };
            modifiedResponse.gridData.push(obj);
        });
        modifiedResponse.totalNoOfRecords = response.rows.length;
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_COMPANY_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};
*/

const listCompanyBusiness = async (req) => {
    let response, finalResponse, modifiedResponse = {gridData: []};
    response = await commonListDropdownBusiness(req, req.query.languageId, parseInt(req.query.skip), parseInt(req.query.limit));
    if (arrayNotEmptyCheck(response.data)) {
        modifiedResponse.totalNoOfRecords = response.totalNoOfRecords;
        modifiedResponse.gridData = [...response.data];
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_COMPANY_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
    // request.userIdList = await getUserIdsForAllRolesAccessor(req, COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID);
    // response = await companyAccessors.listCompanyAccessor(request);
    // if (objectHasPropertyCheck(response, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(response.rows)) {
    //     response.rows.forEach((item) => {
    //         let obj = {
    //             companyId: item['company_id'],
    //             companyName: item['company_name'],
    //             companyType: item['company_type'],
    //             customsId: item['customs_id']
    //         };
    //         modifiedResponse.gridData.push(obj);
    //     });
};

const listCompanyDropdownBusiness = async (req) => {
    let response, finalResponse, modifiedResponse = {dropdownList: []};
    response = await commonListDropdownBusiness(req, req.query.languageId, null, null);
    if (arrayNotEmptyCheck(response.data)) {
        response.data.forEach(item => {
            modifiedResponse.dropdownList.push(dropdownCreator(item['companyId'], item['companyName'], false));
        });
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_COMPANY_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};
const commonListDropdownBusiness = async (req, languageId, skip = null, limit = null) => {
    let response, modifiedResponse = {data: [], totalNoOfRecords: 0}, totalRecords,
        request = notNullCheck(skip) && notNullCheck(limit) ? {languageId, skip, limit} : {languageId};
    request.userIdList = await getUserIdsForAllRolesAccessor(req, COMMON_CONSTANTS.FENNIX_USER_DATA_MODIFIER_USER_USERID);
    response = await companyAccessors.listCompanyAccessor(request);
    if (objectHasPropertyCheck(response, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(response.rows)) {
        response.rows.forEach((item) => {
            let obj = responseObjectCreator(item, ['companyId', 'companyName', 'companyType', 'customsId', 'noOfRoutes', 'noOfClients'], ['company_id', 'company_name', 'company_type', 'customs_id', 'no_of_routes', 'no_of_clients']);
            modifiedResponse.data.push(obj);
        });
        modifiedResponse.data.sort((prev, next) => prev.companyId - next.companyId);
        totalRecords = await companyAccessors.totalNoOfCompaniesAccessor(request.userIdList);
        modifiedResponse.totalNoOfRecords = objectHasPropertyCheck(totalRecords, 'rows') && arrayNotEmptyCheck(totalRecords['rows']) ? totalRecords['rows'][0]['count'] : 0;
    }
    return modifiedResponse;
};

const editCompanyBusiness = async (req) => {
    let request = req.body, response, finalResponse, routeResponse;
    request.updatedBy = request.userId;
    request.updatedDate = new Date();
    response = await companyAccessors.editCompanyAccessor(request);
    routeResponse = await routeBusiness.editCompanyRoutesBusiness(req);
    if (notNullCheck(response) && response['rowCount'] !== 0 && notNullCheck(routeResponse)) {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_COMPANY_EDIT_SUCCESS, 'EN_US', 'Updated company data successfully');
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_COMPANY_FOR_ID, 'EN_US', '');
    }
    return finalResponse;
};

const deleteCompanyBusiness = async (req) => {
    let request = {
        companyId: parseInt(req.query.companyId),
        isActive: false,
        updatedBy: req.query.userId,
        updatedDate: new Date()
    };
    await companyAccessors.editCompanyAccessor(request);
    await routeBusiness.deleteCompanyRoutesBusiness(req);
    return fennixResponse(statusCodeConstants.STATUS_OK, 'EN', 'Deleted company & route successfully');
};

const getCompanyDetailsBusiness = async (req) => {
    let request = {languageId: req.query.languageId, companyIdList: [req.query.companyId]}, response, modifiedResponse,
        finalResponse,
        primaryAddressResponse, routeResponse, routeArray = [];
    response = await companyAccessors.getCompanyDetailsAccessor(request);
    primaryAddressResponse = await routeBusiness.getPrimaryAddressByCompanyIdBusiness(parseInt(req.query.companyId));
    routeResponse = await routeBusiness.getCommonRouteByCompanyIdBusiness(parseInt(req.query.companyId));
    if (objectHasPropertyCheck(response, 'rows') && arrayNotEmptyCheck(response.rows)) {
        let companyObj = responseObjectCreator(response.rows[0], ['companyId', 'companyName', 'companyType', 'companyPhone', 'companyEmail', 'companyState', 'companyCity', 'companyCountry', 'customsId', 'companyAddress'],
            ['company_id', 'company_name', 'company_type', 'company_phone', 'company_email', 'company_state', 'company_city', 'company_country', 'customs_id', 'company_address']);
        let addressObj = arrayNotEmptyCheck(primaryAddressResponse) ? responseObjectCreator(primaryAddressResponse[0], ['companyAddress', 'primaryWarehouseAddress', 'primaryPortAddress'], ['companyAddress', 'primaryWarehouseAddress', 'primaryPortAddress']) : [];
        if (arrayNotEmptyCheck(routeResponse)) {
            routeResponse.forEach((route) => {
                let routeObj = responseObjectCreator(route, ['routeId', 'startAddress', 'endAddress', 'wayPoints', 'stoppagePoints', 'totalDistance', 'steps'], ['_id', 'startAddress', 'endAddress', 'wayPoints', 'stoppagePoints', 'totalDistance', 'steps']);
                routeArray.push(routeObj);
            });
        }
        modifiedResponse = {...companyObj, ...addressObj, ...routeArray};
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_COMPANY_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};
const sortCompanyBusiness = async (req) => {
    let request = req.body, response, finalResponse;
    return finalResponse;
};

module.exports = {
    addCompanyBusiness,
    editCompanyBusiness,
    deleteCompanyBusiness,
    listCompanyBusiness,
    sortCompanyBusiness,
    listCompanyDropdownBusiness,
    getCompanyDetailsBusiness
};
