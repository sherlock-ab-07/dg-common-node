var express = require('express');
const { LiteUserTracking } = require('../repository-module/models/lite-user-tracking-model')
const { fetchUserTrackingCounter } = require('../repository-module/queries/lite-util-query')
var router = express.Router();



router.get("/userTracking", (req, res) => {
     console.log("params", req.query);
     let params = {
        userId: req.query.userId,
        date:{
            $gt: req.query.startDate,
            $lt: req.query.endDate
        }
      };
    LiteUserTracking.find(params, (err, data) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(data);
        return;
    });
});

router.post("/userTracking", (req, res) => {
    // console.log("body", req.body);
    fetchUserTrackingCounter().then(
        (data) => {
            req.body._id = data;
            console.log("_id", req.body._id);
            let liteUser = new LiteUserTracking(req.body);
            liteUser.save((err, data) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.status(200).send(data);
                return;
            });
        }
    )
});


module.exports = router;