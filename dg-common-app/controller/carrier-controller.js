const express = require('express');
const router = express.Router();
const {listCarrierBusiness} = require('../business-module/carrier-business-module/carrier-business');

router.get('/listCarriers', function (req, res) {
    let returnObj;
    returnObj = listCarrierBusiness();
    returnObj.then((response) => {
        res.send(response);
    })
});

module.exports = router;