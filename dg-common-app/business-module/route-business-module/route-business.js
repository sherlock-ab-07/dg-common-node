const routeAccessors = require('../../repository-module/data-accesors/route-accessor');
const {objectHasPropertyCheck, arrayNotEmptyCheck, responseObjectCreator} = require('../../util-module/data-validators');
const {fennixResponse} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const {statusCodeConstants} = require('../../util-module/response-status-constants/status-code-constants');

const insertCompanyRouteBusiness = async (req) => {
    let request = req, routeRequest = {}, response, counterResponse, companyId = 0,
        routeArray = [];
    counterResponse = await routeAccessors.fetchAndUpdateCompanyRoutePrimaryKeyAccessor();
    // console.log(counterResponse);
    let routeId = counterResponse[0]['counter'];
    companyId = parseInt(request['companyId'], 10);
    let primaryAddressRequest = responseObjectCreator(request, ['companyId', 'companyAddress', 'primaryWarehouseAddress', 'primaryPortAddress'], ['companyId', 'companyAddress', 'primaryWarehouseAddress', 'primaryPortAddress']);
    ['companyId', 'companyAddress', 'primaryWarehouseAddress', 'primaryPortAddress'].forEach((reqItem) => {
        delete routeRequest[reqItem];
    });
    await routeAccessors.insertCompanyPrimaryAddressAccessor(primaryAddressRequest);
    if (objectHasPropertyCheck(request, 'routes') && arrayNotEmptyCheck(request.routes)) {

        request.routes.forEach((route) => {
            const newRoute = responseObjectCreator(route, ['startAddress', 'endAddress', 'waypoints', 'stoppagePoints', 'totalDistance', 'steps', 'routeName'], ['startAddress', 'endAddress', 'waypoints', 'stoppagePoints', 'totalDistance', 'steps', 'routeName']);
            newRoute['companyId'] = companyId;
            newRoute['_id'] = routeId;
            routeId++;
            routeArray.push(newRoute);
        });
        response = await routeAccessors.insertRouteAccessor(routeArray);
        await routeAccessors.updateCompanyRoutePrimaryKeyAccessor(routeId);
    }
    console.log(response);
    return response;
};

const deleteCompanyRoutesBusiness = async (req) => {
    let request = {isActive: false};
    await routeAccessors.editCompanyRoutesAccessor(req.body.routeId, request);
};

const editCompanyRoutesBusiness = async (req) => {
    let request = req.body, routeRequest = {}, response;
    routeRequest.companyId = request.companyId;
    routeRequest.companyAddress = request.companyAddress;
    routeRequest.primaryWarehouseAddress = request.primaryWarehouseAddress;
    routeRequest.primaryPortAddress = request.primaryPortAddress;
    routeRequest.startAddress = request.startAddress;
    routeRequest.endAddress = request.endAddress;
    response = await routeAccessors.editCompanyRoutesAccessor(request.routeId, routeRequest);
    return response;
};

const getRouteByCompanyIdBusiness = async (req) => {
    const companyId = parseInt(req.query.companyId);
    let routeResponse = await getCommonRouteByCompanyIdBusiness(companyId);
    console.log(routeResponse);
    return fennixResponse(200, 'EN_US', routeResponse);
};

const getRouteByCompanyIdGridDataBusiness = async (req) => {
    let companyId = parseInt(req.query.companyId), modifiedResponse = {gridData: []}, finalResponse = {};
    let routeResponse = await getCommonRouteByCompanyIdBusiness(companyId);
    if (arrayNotEmptyCheck(routeResponse)) {
        modifiedResponse.gridData = routeResponse;
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_ROUTE_FOR_ID, 'EN_US', modifiedResponse);
    }
    return finalResponse;
};

const getCommonRouteByCompanyIdBusiness = async (req) => {
    let routeResponse;
    routeResponse = await routeAccessors.getRouteByCompanyIdAccessor(req);
    return routeResponse;
};

const getPrimaryAddressByCompanyIdBusiness = async (req) => {
    let response;
    response = await routeAccessors.getPrimaryAddressByCompanyIdAccessor(req);
    return response;
};
const getRouteDetailsByRouteIdBusiness = async (req) => {
    let response, finalResponse;
    response = await routeAccessors.getRouteByRouteIdAccessor(parseInt(req.query.routeId));
    if (arrayNotEmptyCheck(response)) {
        let obj = responseObjectCreator(response[0], ['companyId', 'routeId', 'startAddress', 'endAddress', 'wayPoints', 'stoppagePoints', 'totalDistance', 'steps'], ['companyId', '_id', 'startAddress', 'endAddress', 'wayPoints', 'stoppagePoints', 'totalDistance', 'steps']);
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', obj);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_ROUTE_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};
module.exports = {
    getPrimaryAddressByCompanyIdBusiness,
    editCompanyRoutesBusiness,
    insertCompanyRouteBusiness,
    getRouteByCompanyIdBusiness,
    getCommonRouteByCompanyIdBusiness,
    getRouteDetailsByRouteIdBusiness,
    deleteCompanyRoutesBusiness,
    getRouteByCompanyIdGridDataBusiness
};
