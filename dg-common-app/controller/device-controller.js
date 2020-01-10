const deviceBusiness = require('../business-module/device-business-module/device-business');
var express = require('express');
var router = express.Router();

router.get('/deviceAggregator', function (req, res) {
    let returnObj;
    returnObj = deviceBusiness.deviceAggregatorDashboard(req);
    returnObj.then((response) => {
        res.send(response);
    })
});
router.get('/listUnAssignedDevices', function (req, res) {
    let returnObj;
    returnObj = deviceBusiness.listUnAssignedDevicesBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/listDeviceTypes', function (req, res) {
    let returnObj;
    returnObj = deviceBusiness.listDeviceTypesBusiness();
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/listDevices', function (req, res) {
    let returnObj;
    returnObj = deviceBusiness.listDevicesBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.post('/addDevice', function (req, res) {
    let returnObj;
    returnObj = deviceBusiness.insertDeviceBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/getDeviceDetails', function (req, res) {
    let returnObj;
    returnObj = deviceBusiness.getDeviceByDeviceIdBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/delinkDevice', function (req, res) {
    let returnObj;
    returnObj = deviceBusiness.unlinkDeviceForBeneficiaryBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/getDeviceDetailsByBeneficiaryId', function (req, res) {
    let returnObj;
    returnObj = deviceBusiness.getDeviceDetailsByBeneficiaryIdBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/checkIfDevicePresent', function (req, res) {
    let returnObj;
    returnObj = deviceBusiness.checkIfDeviceIsPresentBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/listELocks', function (req, res) {
    let returnObj;
    returnObj = deviceBusiness.listElockDevicesBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.post('/deleteDevice', function (req, res) {
    let returnObj;
    returnObj = deviceBusiness.deleteDeviceBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.post('/editDevice', function (req, res) {
    let returnObj;
    returnObj = deviceBusiness.editDeviceBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

module.exports = router;