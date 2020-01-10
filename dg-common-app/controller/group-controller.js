const {listGroupsBusiness} = require('../business-module/group-business-module/group-business');
const express = require('express');
const router = express.Router();

router.get('/listGroups', function (req, res) {
    let returnObj;
    returnObj = listGroupsBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

module.exports = router;