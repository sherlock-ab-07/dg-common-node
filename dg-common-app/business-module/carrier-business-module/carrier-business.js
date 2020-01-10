const {listCarriersAccessor} = require('../../repository-module/data-accesors/carrier-accessor');
const {arrayNotEmptyCheck} = require('../../util-module/data-validators');
const {fennixResponse,dropdownCreator} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const {statusCodeConstants} = require('../../util-module/response-status-constants/status-code-constants');

const listCarrierBusiness = async () => {
    let response, finalResponse, carrierListResponse = {dropdownList: []};
    response = await listCarriersAccessor();
    if (arrayNotEmptyCheck(response)) {
        response.forEach((item) => {
            carrierListResponse.dropdownList.push(dropdownCreator(item['_id'], item['name'], false));
        });
    }
    finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', carrierListResponse);
    return finalResponse;
};

module.exports = {
    listCarrierBusiness
};