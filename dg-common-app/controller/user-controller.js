const userBusiness = require('../business-module/user-business-module/user-business');
const express = require('express');
const {USER_CONTROLLER} = require('../util-module/util-constants/fennix-controller-constants');
const router = express.Router();

router.get(USER_CONTROLLER.USER_FETCH_USER_PROFILE, async (req, res) => {
    let returnObj;
    returnObj = userBusiness.fetchUserDetailsBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});
router.post(USER_CONTROLLER.USER_UPDATE_USER_PROFILE, async (req, res) => {
    let returnObj;
    returnObj = userBusiness.updateUserProfileBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get(USER_CONTROLLER.USER_GET_USER_LIST, async (req, res) => {
    let returnObj;
    returnObj = userBusiness.getUserListBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get(USER_CONTROLLER.USER_DOWNLOAD_USER, async (req, res) => {
    let returnObj;
    returnObj = userBusiness.downloadUsersListBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get(USER_CONTROLLER.USER_LIST_OPERATORS,async (req, res) => {
    let returnObj;
    returnObj = userBusiness.listOperatorsBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.post(USER_CONTROLLER.USER_ADD_USER, async (req, res) => {
    let returnObj;
    returnObj = userBusiness.addUserBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get(USER_CONTROLLER.USER_GET_USER_DETAILS, async (req, res) => {
    let returnObj;
    returnObj = userBusiness.fetchUserDetailsBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.post(USER_CONTROLLER.USER_UPDATE_USER, async (req, res) => {
    let returnObj;
    returnObj = userBusiness.updateUserBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get(USER_CONTROLLER.USER_DELETE_USER, async (req, res) => {
    let returnObj;
    returnObj = userBusiness.deleteUserBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});
router.get(USER_CONTROLLER.USER_LIST_UNASSIGNED_CLIENTS, async (req, res) => {
    let returnObj;
    returnObj = userBusiness.listUnassignedClientsBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get(USER_CONTROLLER.USER_LIST_CLIENTS_BY_COMPANY_ID, async (req, res) => {
    let returnObj;
    returnObj = userBusiness.listClientsByCompanyIdBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});


router.get('/getAllUserDetails', async (req, res) => {
    let returnObj;
    returnObj = userBusiness.fetchAllUserDetailsBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

module.exports = router;
