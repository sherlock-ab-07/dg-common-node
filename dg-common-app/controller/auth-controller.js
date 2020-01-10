const express = require('express');
const router = express.Router();
const authBusiness = require('../business-module/auth-business-module/auth-business');

/* GET home page. */
router.post('/authenticate', function (req, res) {
    var returnObj = authBusiness.authenticateUser(req);
    returnObj.then((authResponse) => {
        res.header('x-sofia-auth', authResponse.header).send(authResponse.response);
    })
});

router.post('/forgotPasswordLink', function (req, res) {
    var returnObj = authBusiness.forgotPasswordBusiness(req);
    returnObj.then((authResponse) => {
        res.send(authResponse);
    })
});

router.post('/resetPassword', function (req, res) {
    var returnObj = authBusiness.resetPasswordBusiness(req);
    returnObj.then((authResponse) => {
        res.send(authResponse);
    })
});

router.get('/fetchLoginProfile', function (req, res) {
    var returnObj = authBusiness.fetchLoginProfileBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/updateLoginProfile', function (req, res) {
    var returnObj = authBusiness.authenticateUser(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get('/checkMailId', function (req, res) {
    var returnObj = authBusiness.checkEmailId(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

module.exports = router;