const {listGroupsAccessor} = require('../../repository-module/data-accesors/group-accessor');
const {getCenterIdsAccessor} = require('../../repository-module/data-accesors/metadata-accesor');
const {objectHasPropertyCheck, arrayNotEmptyCheck} = require('../../util-module/data-validators');
const {fennixResponse} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const {statusCodeConstants} = require('../../util-module/response-status-constants/status-code-constants');


const listGroupsBusiness = async (req) => {
    let listCenterIdsResponse, centerIds  = [], groupsResponse, finalResponse, modifiedResponse = [];
    listCenterIdsResponse = await getCenterIdsAccessor(req);
    if (objectHasPropertyCheck(listCenterIdsResponse, 'rows') && arrayNotEmptyCheck(listCenterIdsResponse.rows)) {
        listCenterIdsResponse.rows.forEach(item => {
            centerIds.push(item['location_id']);
        });
        groupsResponse = await listGroupsAccessor(centerIds);
    }
    if (objectHasPropertyCheck(groupsResponse, 'rows') && arrayNotEmptyCheck(groupsResponse.rows)) {
        groupsResponse.rows.forEach(item => {
            let obj = {
                groupId: item['group_id'],
                groupName: item['group_name'],
                centerId: item['center_id'],
                centerName: item['center_name'],
                isActive: item['isactive']
            };
            modifiedResponse.push(obj);
        });
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_GROUPS_TYPES_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};

module.exports = {
    listGroupsBusiness
};