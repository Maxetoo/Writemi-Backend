const Bookmark = require('../models/bookmarkModel')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors/index')

const addToBookmark = async (req, res) => {
  const userID = req.user.userID
  const { source, message, link } = req.body
  if (!source || !message || !link)
    throw new CustomError.BadRequestError(`unable to add to bookmark`)
  const findBookmark = await Bookmark.findOne({
    message,
    user: userID,
  })
  if (findBookmark)
    throw new CustomError.BadRequestError('already added to bookmark')

  const bookmark = await Bookmark.create({
    source,
    message,
    link,
    user: userID,
  })

  res.status(StatusCodes.OK).json({
    bookmark,
  })
}

const getAllBookmarks = async (req, res) => {
  const { search } = req.query
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 7
  const skip = (page - 1) * limit
  const total = await Bookmark.countDocuments({})
  const userID = req.user.userID
  const bookmarks = await Bookmark.find({
    user: userID,
    message: {
      $regex: search || '',
      $options: 'i',
    },
  })
    .limit(limit)
    .skip(skip)
  res.status(StatusCodes.OK).json({
    bookmarks,
    count: total,
  })
}

const removeFromBookmark = async (req, res) => {
  const { id } = req.params
  const bookmark = await Bookmark.findOne({
    _id: id,
  })
  if (!bookmark)
    throw new CustomError.NotFoundError(`No bookmark id of ${id} found`)
  await Bookmark.findByIdAndRemove({
    _id: id,
  })
  res.status(StatusCodes.OK).json({
    msg: `Bookmark removed successfully`,
  })
}

const clearAllBookmarks = async (req, res) => {
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
