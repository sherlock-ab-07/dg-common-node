var express = require('express');
const ticketBusiness = require('../business-module/ticket-business-module/ticket-business');
const {TICKET_CONTROLLER} = require('../util-module/util-constants/fennix-controller-constants');
var router = express.Router();

router.get(TICKET_CONTROLLER.TICKET_TICKET_AGGREGATOR, function (req, res) {
    let returnObj;
    returnObj = ticketBusiness.ticketAggregatorBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    })
});

router.get(TICKET_CONTROLLER.TICKET_LIST_ALERT_TYPES, function (req, res) {
    let returnObj;
    returnObj = ticketBusiness.listAlertTypesBusiness();
    returnObj.then((response) => {
        res.send(response);
    });
});

//TODO: commented by paapu. will check with chinnu
// router.get('/ticketDetails', function (req, res) {
//     let returnObj;
//     returnObj = ticketListBasedOnStatusBusiness(req);
//     returnObj.then((response) => {
//         res.send(response);
//     });
// });

router.get(TICKET_CONTROLLER.TICKET_TICKET_DETAILS, function (req, res) {
   let returnObj;
   returnObj = ticketBusiness.ticketDetailsBasedOnTicketIdBusiness(req);
   returnObj.then((response) => {
      res.send(response);
   });
});

router.get(TICKET_CONTROLLER.TICKET_LIST_TICKETS, function (req, res) {
    let returnObj;
    returnObj = ticketBusiness.listTicketsBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    });
});

router.post(TICKET_CONTROLLER.TICKET_ADD_TICKET, function (req, res) {
    let returnObj;
    returnObj = ticketBusiness.addTicketBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    });
});

router.get(TICKET_CONTROLLER.TICKET_DOWNLOAD_LIST_TICKETS, function (req, res) {
    let returnObj;
    returnObj = ticketBusiness.listTicketsForDownloadBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    });
});

router.post(TICKET_CONTROLLER.TICKET_UPDATE_TICKET, function (req, res) {
    let returnObj;
    returnObj = ticketBusiness.updateTicketBusiness(req);
    returnObj.then((response) => {
        res.send(response);
    });
});

module.exports = router;