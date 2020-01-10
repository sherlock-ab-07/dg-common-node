var express = require('express');
var router = express.Router();
const beneficiaryBusiness = require('../business-module/beneficiary-business-module/beneficiary-business');
const beneficiaryMapBusiness = require('../business-module/beneficiary-business-module/beneficiary-map-business');
const locationBusiness = require('../business-module/location-business-module/location-business');
router.get('/listBeneficiariesForAddTicket', function (req, res) {
    let returnObj;
    returnObj = beneficiaryBusiness.listBeneficiariesForAddTicketBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/listTimeZone', function (req, res) {
    let returnObj;
    returnObj = beneficiaryBusiness.getTimeZoneDetailsBusiness();
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/beneficiaryAggregator', function (req, res) {
    let returnObj;
    returnObj = beneficiaryBusiness.beneficiaryAggregatorBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.post('/beneficiaryListByOwner', function (req, res) {
    let returnObj;
    returnObj = beneficiaryBusiness.beneficiaryListByOwnerUserId(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.post('/showMap', function (req, res) {
    let returnObj;
    returnObj = beneficiaryBusiness.beneficiaryLocationListByOwnerAndCenter(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/listBeneficiary', function (req, res) {
    let returnObj;
    returnObj = beneficiaryBusiness.beneficiaryListByOwnerUserId(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/downloadBeneficiaries', function (req, res) {
    let returnObj;
    returnObj = beneficiaryBusiness.downloadBeneficiariesBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});
router.get('/beneficiaryDocumentList', function (req, res) {
    let returnObj;
    returnObj = beneficiaryBusiness.getBenficiaryDocumentDownloadListBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.post('/addBeneficiary', function (req, res) {
    let returnObj;
    returnObj = beneficiaryBusiness.addBeneficiaryBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.post('/showMapGridData', function (req, res) {
    let returnObj;
    returnObj = beneficiaryMapBusiness.beneficiaryTrackMapBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/getBeneficiaryDetails', function (req, res) {
    let returnObj;
    returnObj = beneficiaryBusiness.getBeneficiaryDetailsBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/getCompleteBeneficiaryDetailsByBenId', function (req, res) {
    let returnObj;
    returnObj = beneficiaryBusiness.getAllBeneficiaryDetailsBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});
router.post('/updateBeneficiary', function (req, res) {
    let returnObj;
    returnObj = beneficiaryBusiness.updateBeneficiaryBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});
router.get('/deleteBeneficiary', function (req, res) {
    let returnObj;
    returnObj = beneficiaryBusiness.deleteBeneficiaryBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.post('/uploadDocumentsForBeneficiary', function (req, res) {
    let returnObj;
    returnObj = beneficiaryBusiness.uploadBeneficiaryDocumentsBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.post('/getBeneficiaryMapHistory', function (req, res) {
    let returnObj;
    returnObj = beneficiaryMapBusiness.getBeneficiaryMapHistoryBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/listUnAssignedBeneficiary', function (req, res) {
    let returnObj;
    returnObj = beneficiaryBusiness.beneficiaryListForUnAssignedDevicesBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});
router.post('/addDeviceForBeneficiary', function (req, res) {
    let returnObj;
    returnObj = beneficiaryBusiness.addDeviceForBeneficiaryBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});
module.exports = router;