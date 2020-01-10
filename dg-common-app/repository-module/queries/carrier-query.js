const {CarrierModel} = require('../models/carrier-model');

const listCarriersQuery = () => {
    return CarrierModel.find(
        {
            active: true
        },
        {
            name: 1
        }
    );
};

module.exports = {
    listCarriersQuery
};