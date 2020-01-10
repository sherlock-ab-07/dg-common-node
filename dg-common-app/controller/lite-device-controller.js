var express = require('express');
const { LiteDevice } = require('../repository-module/models/lite-device-model')
const { fetchDeviceCounter } = require('../repository-module/queries/lite-util-query')
var router = express.Router();

router.get("/devices", (req, res) => {
    console.log("query", req.query);
    LiteDevice.find(req.query, (err, data) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(data);
        return;
    });

});

router.get("/device/:_id", (req, res) => {
     console.log("params", req.params);
    LiteDevice.find(req.params, (err, data) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(data);
        return;
    });
});

router.post("/device", (req, res) => {
    // console.log("body", req.body);
    fetchDeviceCounter().then(
        (data) => {
            req.body._id = data;
            console.log("_id", req.body._id);
            let liteUser = new LiteDevice(req.body);
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

router.put("/device/:_id", (req, res) => {
    console.log("params", req.params);
    LiteDevice.update(req.params,req.body,(err, raw)=> {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(raw);
        return;
    })

});

module.exports = router;