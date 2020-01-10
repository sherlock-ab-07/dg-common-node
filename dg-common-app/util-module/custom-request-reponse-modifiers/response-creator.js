const {Client, Pool} = require('pg');
const {statusCodes} = require('../response-status-constants/status-message-constants');
const {postgresDBDev, postgresDBLocal, postgresSofiaDev} = require('../connection-constants');
const pool = new Pool(postgresSofiaDev);
const fennixResponse = (status, language, data) => {
    let returnObj = {};
    if (typeof status !== "number") {
        throw new Error('status must be a number');
    } else {
        returnObj = {
            responseStatus: status,
            userMessage: statusCodes[status]['userMsg'][language],
            devMessage: statusCodes[status]['devMsg'],
            responseData: data
        };
    }
    return returnObj;
};

const connectionCheckAndQueryExec = async (req, query) => {
    let returnQuery;
    const start = Date.now();
    if (query !== null && query !== undefined && query !== '') {
        req = req !== null && req !== undefined && req !== '' ? req : [];
        returnQuery = await pool.query(query, req);
        // const duration = Date.now() - start;
        // console.log(`query  took : ${duration}`);
    }
    // const postgresClient = new Client(postgresSofiaDev);
    // await postgresClient.connect();
    // returnQuery = await postgresClient.query(query, req);
    // await postgresClient.end();
    return returnQuery;
};

const dropdownCreator = (dropdownKey, dropdownValue, isDisabledFlag) => {
    return {dropdownKey, dropdownValue, isDisabledFlag}
};

const dropdownActionButtonCreator = (dropdownActionButton) => {
    let dropdownAction = {
        dropdownSetId: dropdownActionButton['dropdown_set_id'],
        dropdownKey: dropdownActionButton['dropdown_key'],
        dropdownId: dropdownActionButton['dropdown_id'],
        dropdownValue: dropdownActionButton['dropdown_value'],
        isDisabledFlag: dropdownActionButton['is_disable'],
        dropdownTransferKey: dropdownActionButton['dropdown_transfer_key'],
        dropdownIconKey: dropdownActionButton['dropdown_action_button_icon_key'],
        dropdownIconValue: dropdownActionButton['dropdown_action_button_icon_value'],
        isPrimaryAction: dropdownActionButton['is_primary_action']
    };
    if (dropdownActionButton['is_action_button']) {
        dropdownAction = {
            ...dropdownAction,
            modalId: dropdownActionButton['dropdown_action_button_modal_id'],
            actionType: dropdownActionButton['action_name'],
            submitEndpoint: dropdownActionButton['endpoint'],
            subReqType: dropdownActionButton['endpoint_request_type'],
            subReqParams: dropdownActionButton['endpoint_mandatory_request_params'],
            navigationRouteName: dropdownActionButton['route_name'],
            navigationRouteUrl: dropdownActionButton['route_url'],
            navigationRouteId: dropdownActionButton['route_id']
        }
    }
    return dropdownAction;
};
module.exports = {
    connectionCheckAndQueryExec,
    fennixResponse,
    dropdownCreator,
    dropdownActionButtonCreator
};