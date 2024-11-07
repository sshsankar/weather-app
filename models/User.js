const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    recent_history: {
        type: Array,
        default: [],
    },
});

module.exports = mongoose.model('User', UserSchema);
