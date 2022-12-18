const express = require('express')
const BookmarkRoute = express.Router()
const { authorization } = require('../middlewares/authorization')
const {
    addToBookmark,
    removeFromBookmark,
    getAllBookmarks,
    clearAllBookmarks,
} = require('../controllers/bookmarkController')

BookmarkRoute.route('/addToBookmark').post(authorization, addToBookmark)
BookmarkRoute.route('/getBookmarks').get(authorization, getAllBookmarks)
BookmarkRoute.route('/clearBookmarks').delete(authorization, clearAllBookmarks)
BookmarkRoute.route('/deleteBookmark/:id').delete(
    authorization,
    removeFromBookmark
)

module.exports = BookmarkRoute