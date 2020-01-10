var express = require('express');
const { LiteUser } = require('../repository-module/models/lite-user-model')
const { fetchUserCounter } = require('../repository-module/queries/lite-util-query')
var router = express.Router();

router.get("/users", (req, res) => {
    console.log("query", req.query);
    LiteUser.find(req.query, (err, data) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(data);
        return;
    });

});

router.get("/user/:_id", (req, res) => {
     console.log("params", req.params);
    LiteUser.find(req.params, (err, data) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(data);
        return;
    });
});

router.post("/user", (req, res) => {
    // console.log("body", req.body);
    fetchUserCounter().then(
        (data) => {
            req.body._id = data;
            console.log("_id", req.body._id);
            let liteUser = new LiteUser(req.body);
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

router.put("/user/:_id", (req, res) => {
    console.log("params", req.params);
    LiteUser.update(req.params,req.body,(err, raw)=> {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(raw);
        return;
    })

});

module.exports = router;