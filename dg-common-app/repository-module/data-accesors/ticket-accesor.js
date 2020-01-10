const ticketQuery = require('../queries/ticket-query');

const ticketAggregatorAccessor = async (req) => {
    let returnObj;
    returnObj = await ticketQuery.userIdTicketAggregatorQuery(req);
    return returnObj;
};

// const listTicketsBasedOnUserIdAccessor = async (req) => {
//     let returnObj;
//     returnObj = await listTicketsQuery(req);
//     return returnObj;
// };

const totalNoOfTicketsBasedOnUserIdAccessor = async (req) => {
    let returnObj;
    returnObj = await totalNoOfTicketsBasedOnUserIdQuery(req);
    return returnObj;
};

const ticketListBasedOnTicketStatusAccessor = async (req) => {
    let returnObj;
    returnObj = await ticketQuery.userIdTicketDetailsBasedOnTicketStatusQuery(req);
    return returnObj;
};

const ticketDetailsBasedOnTicketIdAccessor = async (req) => {
  let returnObj;
  returnObj = await ticketQuery.ticketDetailsBasedOnTicketIdQuery(req);
  return returnObj;
};

const listTicketsBasedOnUserIdAccessor = async (req) => {
    let returnObj;
    returnObj = await ticketQuery.listTicketsQuery(req);
    return returnObj;
};

const updateTicketAccessor = async (req) => {
    let returnObj;
    returnObj = await ticketQuery.updateTicketQuery(req);
    return returnObj;
};

const addTicketAccessor = async (req) => {
    let returnObj;
    returnObj = await ticketQuery.addTicketQuery(req);
    return returnObj;
};

const fetchNextPrimaryKeyAccessor = async () => {
    let returnObj;
    returnObj = await ticketQuery.fetchNextPrimaryKeyQuery();
    return returnObj;
};
const getTicketDetailsBasedOnBeneficiaryIdAccessor = async(req) => {
    let returnObj;
    returnObj = await ticketQuery.getTicketDetailsBasedOnBeneficiaryIdQuery(req);
    return returnObj;
};

// const insertNextPrimaryKeyAccessor = async (req) => {
//     await ticketQuery.insertNextPrimaryKeyQuery(req);
// };

const fetchViolationsForBeneficiaryIdAccessor = async (req) => {
    let returnObj;
    returnObj = await ticketQuery.fetchViolationsForBeneficiaryIdQuery(req);
    return returnObj;
};

const listTicketsBasedOnUserIdForDownloadAccessor = async (req) => {
    let returnObj;
    returnObj = await ticketQuery.listTicketsForDownloadQuery(req);
    return returnObj;
};

const getTicketDetailsByStatusAndBenIdAccessor = async (req) => {
    let returnObj;
    returnObj = await ticketQuery.getTicketDetailsByStatusAndBenIdQuery(req);
    return returnObj;
};

const listAlertTypesAccessor = async () => {
    let returnObj;
    returnObj = await ticketQuery.listAlertTypesQuery();
    return returnObj;
};

const getTotalNoOfTicketsAccessor = async (req) => {
    let returnObj;
    returnObj = await ticketQuery.getTotalNoOfTicketsQuery(req);
    return returnObj;
};

module.exports = {
    listAlertTypesAccessor,
    addTicketAccessor,
    ticketAggregatorAccessor,
    fetchNextPrimaryKeyAccessor,
    // insertNextPrimaryKeyAccessor,
    ticketListBasedOnTicketStatusAccessor,
    listTicketsBasedOnUserIdAccessor,
    ticketDetailsBasedOnTicketIdAccessor,
    updateTicketAccessor,
    fetchViolationsForBeneficiaryIdAccessor,
    getTicketDetailsBasedOnBeneficiaryIdAccessor,
    listTicketsBasedOnUserIdForDownloadAccessor,
    getTotalNoOfTicketsAccessor,
    getTicketDetailsByStatusAndBenIdAccessor
};