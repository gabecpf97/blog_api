const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

const postSchema = new Schema({
    title: {type: String, required: true},
    message: {type: String, required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    date: {type: Date, required: true},
});

postSchema.virtual('url').get(function() {
    return `/post/${this.id}`;
});

postSchema.virtual('pretty_date').get(function() {
    return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_FULL);
});

module.exports = mongoose.model('Post', postSchema);