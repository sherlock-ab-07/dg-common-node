var express = require('express');
const { LiteTicket } = require('../repository-module/models/lite-ticket-model')
const { fetchTicketCounter } = require('../repository-module/queries/lite-util-query')
var router = express.Router();

router.get("/tickets", (req, res) => {
    console.log("query", req.query);
    LiteTicket.find(req.query, (err, data) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(data);
        return;
    });

});

router.get("/ticket/:_id", (req, res) => {
     console.log("params", req.params);
    LiteTicket.find(req.params, (err, data) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(data);
        return;
    });
});

router.post("/ticket", (req, res) => {
    // console.log("body", req.body);
    fetchTicketCounter().then(
        (data) => {
            req.body._id = data;
            console.log("_id", req.body._id);
            let liteUser = new LiteTicket(req.body);
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

router.put("/ticket/:_id", (req, res) => {
    console.log("params", req.params);
    LiteTicket.update(req.params,req.body,(err, raw)=> {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(raw);
        return;
    })

});

module.exports = router;