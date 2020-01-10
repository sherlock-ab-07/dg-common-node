const {SearchModel} = require('../models/search-model');

const searchQuery = (req) => {
    return SearchModel.find({
        value: {$regex: `.*${req['value']}.*`, $options: 'i'},
        tag: req['tag']
    });
};

const insertSearchQuery = (req) => {
    return SearchModel.collection.insertMany(req, function (err, doc) {
        if (err) {
            console.log('error while saving search request');
        } else {
            console.log('Saved search request successfully');
        }
    });
};

const insertOrUpdateSearchQuery = (req) => {
    return SearchModel.collection.update({tag: req.tag, value: req.value},
        {
            $set: {tag: req.tag, value: req.value}
        }, {upsert: true})
};

module.exports = {
    searchQuery,
    insertSearchQuery,
    insertOrUpdateSearchQuery
};
