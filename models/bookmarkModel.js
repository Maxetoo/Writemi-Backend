const mongoose = require('mongoose')

const BookmarkModel = new mongoose.Schema({
    source: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
})

module.exports = mongoose.model('Bookmarks', BookmarkModel)