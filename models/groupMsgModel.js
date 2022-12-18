const mongoose = require('mongoose')

const UpvoteSchema = new mongoose.Schema({
    counts: {
        type: mongoose.Types.ObjectId,
    },
})

const DownvoteSchema = new mongoose.Schema({
    counts: {
        type: mongoose.Types.ObjectId,
    },
})

const MessageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: [true, 'Please input your message'],
        minLength: 5,
        maxLength: 250,
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
    },
    flagged: {
        type: Boolean,
        default: false,
    },
    upvotes: [UpvoteSchema],
    downvotes: [DownvoteSchema],
    reports: [{
        type: mongoose.Types.ObjectId,
    }, ],
    bookmarks: [{
        type: mongoose.Types.ObjectId,
    }, ],
}, {
    timestamps: true,
})

const groupClusterSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 15,
        trim: true,
    },
    description: {
        type: String,
        minLength: 3,
    },
    muted: {
        type: Boolean,
        default: false,
    },
    messages: [MessageSchema],
    locked: {
        type: Boolean,
        default: false,
    },
    passkey: {
        type: String,
        required: false,
        minLength: 5,
    },
}, {
    timestamps: true,
})

groupClusterSchema.index({ createdBy: 1, name: 1 }, { unique: true })

module.exports = mongoose.model('GroupMessage', groupClusterSchema)