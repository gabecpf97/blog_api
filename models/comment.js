const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    post: {type: Schema.Types.ObjectId, ref: 'Post', required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    message: {type: String, required: true},
    date: {type: Date, required: true},
});

commentSchema.virtual('pretty_date').get(function() {
    return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_FULL);
});

module.exports = mongoose.model('Comment', commentSchema);