const searchAccessors = require('../../repository-module/data-accesors/search-accessor');
const {arrayNotEmptyCheck, responseObjectCreator, objectHasPropertyCheck} = require('../../util-module/data-validators');
const {fennixResponse} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const {statusCodeConstants} = require('../../util-module/response-status-constants/status-code-constants');
const {SEARCH_MAP} = require('../../util-module/util-constants/fennix-search-constants');

const searchBusiness = async (req) => {
    let request, response, modifiedResponse = {dropdownList: []}, finalResponse,tag;
    tag = req.query.tag && SEARCH_MAP[req.query.tag] ? SEARCH_MAP[req.query.tag] : '';
    response = await searchAccessors.searchAccessor({value: req.query.searchValue, tag});
    if (arrayNotEmptyCheck(response)) {
        response.forEach((item) => {
            let obj = responseObjectCreator(item, ['dropdownKey', 'dropdownValue', 'tag'], ['value', 'value', 'tag']);
            modifiedResponse.dropdownList.push(obj);
        });
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_DATA_FOR_GIVEN_SEARCH, 'EN_US', []);
    }
    return finalResponse;
};
const insertSearchBusiness = async (req) => {
    await searchAccessors.insertSearchAccessor(req);
};

const insertUpdateSearchBusiness = async (req) => {
    if (objectHasPropertyCheck(req, 'tag') && objectHasPropertyCheck(SEARCH_MAP, req['tag'])) {
        req['tag'] = SEARCH_MAP[req['tag']];
        await searchAccessors.insertOrUpdateSearchAccessor(req);
    }
};

module.exports = {
    searchBusiness,
    insertSearchBusiness,
    insertUpdateSearchBusiness
};
