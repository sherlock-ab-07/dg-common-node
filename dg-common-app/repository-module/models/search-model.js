const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const searchSchema = new Schema({
    value: String,
    tag: String
});

const SearchModel = mongoose.model('SearchModel', searchSchema, 'search');

module.exports = {
    SearchModel
};