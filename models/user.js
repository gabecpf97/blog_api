const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
});

UserSchema.virtual('url').get(function() {
    return `/user/${this.id}`;
});

module.exports = mongoose.model('User', UserSchema);