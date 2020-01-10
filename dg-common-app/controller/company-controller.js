const companyBusiness = require('../business-module/company-business-module/company-business');
var express = require('express');
var router = express.Router();

router.post('/addCompany', function (req, res) {
    let returnObj;
    returnObj = companyBusiness.addCompanyBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});
router.post('/editCompany', function (req, res) {
    let returnObj;
    returnObj = companyBusiness.editCompanyBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/deactivateCompany', function (req, res) {
    let returnObj;
    returnObj = companyBusiness.deleteCompanyBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/listCompany', function (req, res) {
    let returnObj;
    returnObj = companyBusiness.listCompanyBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/sortCompany', function (req, res) {
    let returnObj;
    returnObj = companyBusiness.sortCompanyBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});
router.get('/getCompanyDetails', function (req, res) {
    let returnObj;
    returnObj = companyBusiness.getCompanyDetailsBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/getCompanyDropdownList', function (req, res) {
    let returnObj;
    returnObj = companyBusiness.listCompanyDropdownBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});
router.get('/getCompanyDetailsByCompId', function (req, res) {
    let returnObj;
    returnObj = companyBusiness.getCompanyDetailsBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});
module.exports = router;