const Bookmark = require('../models/bookmarkModel')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors/index')

const addToBookmark = async(req, res) => {
    const userID = req.user.userID
    const { source, message } = req.body
    if (!source && !message)
        throw new CustomError.BadRequestError(`Please fillup inputs`)
    const bookmark = await Bookmark.create({
        source,
        message,
        user: userID,
    })
    res.status(StatusCodes.OK).json({
        msg: `Added to bookmark successfully`,
    })
}

const getAllBookmarks = async(req, res) => {
    const userID = req.user.userID
    const bookmarks = await Bookmark.find({
        user: userID,
    })
    res.status(StatusCodes.OK).json({
        bookmarks,
    })
}

const removeFromBookmark = async(req, res) => {
    const { id } = req.params
    const bookmark = await Bookmark.findOne({
        _id: id,
    })
    if (!bookmark)
        throw new CustomError.NotFoundError(`No bookmark id of ${id} found`)
    await Bookmark.findOneAndDelete({
        _id: id,
    })
}

const clearAllBookmarks = async(req, res) => {
    const userID = req.user.userID
    await Bookmark.deleteMany({
        user: userID,
    })
    res.status(StatusCodes.OK).json({
        msg: `All bookmarks cleared successfully`,
    })
}

module.exports = {
    addToBookmark,
    getAllBookmarks,
    removeFromBookmark,
    clearAllBookmarks,
}