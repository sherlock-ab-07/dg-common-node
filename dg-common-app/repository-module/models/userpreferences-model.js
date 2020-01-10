var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userPreferencesSchema = new Schema({
    _id: {Type: String},
    sideNav: [
        {Type: String}
    ],
    headerId: [{Type: String}],
    userId: {Type: String},
    mainBody: {
        cards: [
            {
                cardReferenceId: {Type: String},
                orderId: {Type: String},
                cardHeaderId: {Type: String},
                cardFilters: [{Type: String}],
                widgets: [
                    {
                        widgetReferenceId: {Type: String},
                        widgetFilters: [{Type: String}],
                        orderId: {Type: String},
                        endpoint: {Type: String}
                    }
                ]
            }
        ],
        columnCount: {Type: Number},
        rowCount: {Type: Number},
        pageTitle: {Type: String}
    }
});

module.exports = mongoose.model('MasterData', userPreferencesSchema, 'userPreferences');