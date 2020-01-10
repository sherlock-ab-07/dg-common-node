const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageCounterSchema = new Schema({
    _id: Schema.Types.ObjectId,
    counter: Number
});

const imageCounterModel = mongoose.model('ImageCounter', imageCounterSchema, 'imageCounter');

module.exports = {imageCounterModel};