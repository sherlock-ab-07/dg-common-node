const USER_CONTROLLER = {
    USER_UPDATE_USER_PROFILE: '/updateProfile',
    USER_LIST_OPERATORS: '/listOperators',
    USER_GET_USER_LIST: '/listUsers',
    USER_DELETE_USER: '/deleteUser',
    USER_UPDATE_USER: '/editUser',
    USER_GET_USER_DETAILS: '/getUserDetails',
    USER_ADD_USER: '/addUser',
    USER_DOWNLOAD_USER: '/downloadUsers',
    USER_FETCH_USER_PROFILE: '/fetchProfile',
    USER_LIST_CLIENTS_BY_COMPANY_ID: '/listClientsByCompanyId',
    USER_LIST_UNASSIGNED_CLIENTS: '/listUnassignedClients'
};

const SIMCARD_CONTROLLER = {
    SIMCARD_LIST_UNASSIGNED_SIMCARDS: '/listUnAssignedSimcards',
    SIMCARD_LIST_SIMCARDS_FOR_USER: '/listSimCards',
    SIMCARD_ADD_SIMCARD: '/addSimcard',
    SIMCARD_GET_SIMCARD_DETAILS: '/simCardDetails',
    SIMCARD_EDIT_SIMCARD: '/editSimcard',
    SIMCARD_DELETE_SIMCARD: '/deleteSimcard',
    SIMCARD_LIST_SIMCARD_TYPES: '/listSimcardTypes'
};


const METADATA_CONTROLLER = {
    METADATA_BASE_METADATA: '/baseMetadata',
    METADATA_CARD_METADTA: '/cardMetadata',
    METADATA_MODAL_METADATA: '/modalMetadata',
    METADATA_LOGIN_METADATA: '/loginMetadata',
    METADATA_CARD_FILTER: '/cardFilters',
    METADATA_PAGE_FILTER: '/pageFilters',
    METADATA_WIDGET_FILTER: '/widgetFilters',
    METADATA_LIST_LANGUAGES: '/listLanguages',
    METADATA_LIST_LANGUAGES_FOR_GRID: '/listLanguagesGrid',
    METADATA_LIST_COUNTRIES: '/listCountries',
    METADATA_LIST_CENTERS: '/listCenters',
    METADATA_ALL_ROLES: '/roles',
    METADATA_LIST_COUNTRIES_FOR_GRID: '/listCountriesForGrid',
    METADATA_ALL_ROLES_FOR_ADMIN: '/getRolesForAdmin',
    METADATA_ALL_ROLES_FOR_NON_ADMIN: '/getRolesForNonAdmin'
};

const TICKET_CONTROLLER = {
    TICKET_TICKET_AGGREGATOR: '/ticketAggregator',
    TICKET_TICKET_DETAILS: '/ticketDetails',
    TICKET_LIST_TICKETS: '/listTickets',
    TICKET_ADD_TICKET: '/addTicket',
    TICKET_LIST_ALERT_TYPES: '/listAlertTypes',
    TICKET_UPDATE_TICKET: '/updateTicket',
    TICKET_DOWNLOAD_LIST_TICKETS: '/downloadTickets',


}
module.exports = {
    USER_CONTROLLER,
    SIMCARD_CONTROLLER,
    METADATA_CONTROLLER,
    TICKET_CONTROLLER
};
