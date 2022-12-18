const mongoose = require('mongoose')

const PersonalMessagesSchema = new mongoose.Schema({
    receiver: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: [true, 'Please provide message'],
        minLength: 5,
        maxLength: 250,
    },
    favorite: {
        type: Boolean,
        default: false,
    },
    flagged: {
        type: Boolean,
        default: false,
    },
    archive: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
})

module.exports = mongoose.model('PersonalMessage', PersonalMessagesSchema)