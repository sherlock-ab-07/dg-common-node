const simcardBusiness = require('../business-module/simcard-business-module/simcard-business');
const {SIMCARD_CONTROLLER} = require('../util-module/util-constants/fennix-controller-constants');
var express = require('express');
var router = express.Router();

router.get(SIMCARD_CONTROLLER.SIMCARD_GET_SIMCARD_DETAILS, (req, res) => {
    let returnObj;
    returnObj = simcardBusiness.getSimCardDetailsBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get(SIMCARD_CONTROLLER.SIMCARD_LIST_UNASSIGNED_SIMCARDS, function (req, res) {
    let returnObj;
    returnObj = simcardBusiness.listUnAssignedSimcardsBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get(SIMCARD_CONTROLLER.SIMCARD_LIST_SIMCARD_TYPES, function (req, res) {
    let returnObj;
    returnObj = simcardBusiness.listSimcardTypesBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.post(SIMCARD_CONTROLLER.SIMCARD_ADD_SIMCARD, function (req, res) {
    let returnObj;
    returnObj = simcardBusiness.addSimcardBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get(SIMCARD_CONTROLLER.SIMCARD_LIST_SIMCARDS_FOR_USER, (req, res) => {
    let returnObj;
    returnObj = simcardBusiness.getSimCardListBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/listELockSimcards', (req, res) => {
    let returnObj;
    returnObj = simcardBusiness.getElockSimCardListBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.post(SIMCARD_CONTROLLER.SIMCARD_EDIT_SIMCARD, function (req, res) {
    let returnObj;
    returnObj = simcardBusiness.editSimcardBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.post(SIMCARD_CONTROLLER.SIMCARD_DELETE_SIMCARD, function (req, res) {
    let returnObj;
    returnObj = simcardBusiness.deleteSimcardBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

module.exports = router;
