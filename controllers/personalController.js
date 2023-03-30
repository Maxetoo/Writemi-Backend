const PersonalMessage = require('../models/personalMsgModel')
const User = require('../models/userModel')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors/index')
const { checkUser, allowAccess } = require('../middlewares/authorization')
const addMessage = async (req, res) => {
  const { username } = req.query
  if (!username) throw new CustomError.BadRequestError(`User must be provided`)
  const userID = await User.findOne({ username })
  if (!userID)
    throw new CustomError.BadRequestError(`${username} doesn't exist`)
  req.body.receiver = userID._id
  const { message } = req.body
  if (!message) throw new CustomError.BadRequestError(`Type something`)
  if (message.length < 5)
    throw new CustomError.BadRequestError(
      `Message has to be more than 5 characters long`
    )
  const token = checkUser(req)
  if (token) {
    if (token.userID.toString() === userID._id.toString()) {
      throw new CustomError.BadRequestError(
        `You can't send message to yourself`
      )
    }
  }

  const user = await PersonalMessage.create(req.body)
  res.status(StatusCodes.CREATED).json({
    personalMessages: user,
  })
}

const deleteMessage = async (req, res) => {
  const userID = req.user.userID
  const { id } = req.params
  const findMessage = await PersonalMessage.find({
    receiver: userID,
    _id: id,
  })
  if (!findMessage) throw new CustomError.NotFoundError(`No message found`)
  await PersonalMessage.findOneAndDelete({
    receiver: userID,
    _id: id,
  })
  res.status(StatusCodes.OK).json({
    msg: `Message deleted successfully`,
  })
}

const clearAllPersonalMessages = async (req, res) => {
  const userID = req.user.userID
  await PersonalMessage.deleteMany({
    user: userID,
  })
  res.status(StatusCodes.OK).json({
    msg: `All messages cleared successfully`,
  })
}

const getAllPersonalMessages = async (req, res) => {
  const { search } = req.query
  const userID = req.user.userID
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 7
  const total = await PersonalMessage.countDocuments({
    receiver: userID,
  })
  const skip = (page - 1) * limit
  const messages = await PersonalMessage.find({
    receiver: userID,
    message: {
      $regex: search || '',
      $options: 'i',
    },
  })
    .limit(limit)
    .skip(skip)

  res.status(StatusCodes.OK).json({
    messages,
    count: total,
  })
}

const getAllMessages = async (req, res) => {
  const messages = await PersonalMessage.find({})
  res.status(StatusCodes.OK).json({ messages, count: messages.length })
}

const getAllArchivedMessages = async (req, res) => {
  const userID = req.user.userID
  const messages = await PersonalMessage.find({
    receiver: userID,
    archive: true,
  })

  res.status(StatusCodes.OK).json({
    messages,
    count: messages.length,
  })
}

const getAllFlaggedMessages = async (req, res) => {
  const userID = req.user.userID
  const messages = await PersonalMessage.find({
    receiver: userID,
    flagged: true,
  })

  res.status(StatusCodes.OK).json({
    messages,
    count: messages.length,
  })
}

const getAllFavoriteMessages = async (req, res) => {
  const userID = req.user.userID
  const messages = await PersonalMessage.find({
    receiver: userID,
    favorite: true,
  })

  res.status(StatusCodes.OK).json({
    messages,
    count: messages.length,
  })
}

const addToFavourite = async (req, res) => {
  const userID = req.user.userID
  const { id } = req.params
  const findMessage = await PersonalMessage.find({
    receiver: userID,
    _id: id,
  })
  if (!findMessage) throw new CustomError.NotFoundError(`No message found`)
  await PersonalMessage.findOneAndUpdate(
    {
      receiver: userID,
      _id: id,
    },
    {
      favorite: true,
    },
    {
      new: true,
      runValidators: true,
    }
  )
  res.status(StatusCodes.OK).json({
    msg: `Message added to favourite`,
  })
}

const addToArchive = async (req, res) => {
  const userID = req.user.userID
  const { id } = req.params
  const findMessage = await PersonalMessage.find({
    receiver: userID,
    _id: id,
  })
  if (!findMessage) throw new CustomError.NotFoundError(`No message found`)
  await PersonalMessage.findOneAndUpdate(
    {
      receiver: userID,
      _id: id,
    },
    {
      archive: true,
    },
    {
      new: true,
      runValidators: true,
    }
  )
  res.status(StatusCodes.OK).json({
    msg: `Message added to archive`,
  })
}

const addToFlagged = async (req, res) => {
  const userID = req.user.userID
  const { id } = req.params
  const findMessage = await PersonalMessage.find({
    receiver: userID,
    _id: id,
  })
  if (!findMessage) throw new CustomError.NotFoundError(`No message found`)
  await PersonalMessage.findOneAndUpdate(
    {
      receiver: userID,
      _id: id,
    },
    {
      flagged: true,
    },
    {
      new: true,
      runValidators: true,
    }
  )
  res.status(StatusCodes.OK).json({
    msg: `Message flagged`,
  })
}

const removeFromFavourite = async (req, res) => {
  const userID = req.user.userID
  const { id } = req.params
  const findMessage = await PersonalMessage.find({
    receiver: userID,
    _id: id,
  })
  if (!findMessage) throw new CustomError.NotFoundError(`No message found`)
  await PersonalMessage.findOneAndUpdate(
    {
      receiver: userID,
      _id: id,
    },
    {
      favorite: false,
    },
    {
      new: true,
      runValidators: true,
    }
  )
  res.status(StatusCodes.OK).json({
    msg: `Message removed from favourite`,
  })
}

const removeFromArchive = async (req, res) => {
  const userID = req.user.userID
  const { id } = req.params
  const findMessage = await PersonalMessage.find({
    receiver: userID,
    _id: id,
  })
  if (!findMessage) throw new CustomError.NotFoundError(`No message found`)
  await PersonalMessage.findOneAndUpdate(
    {
      receiver: userID,
      _id: id,
    },
    {
      archive: false,
    },
    {
      new: true,
      runValidators: true,
    }
  )
  res.status(StatusCodes.OK).json({
    msg: `Message removed from archive`,
  })
}

const removeFromFlagged = async (req, res) => {
  const userID = req.user.userID
  const { id } = req.params
  const findMessage = await PersonalMessage.find({
    receiver: userID,
    _id: id,
  })
  if (!findMessage) throw new CustomError.NotFoundError(`No message found`)
  await PersonalMessage.findOneAndUpdate(
    {
      receiver: userID,
      _id: id,
    },
    {
      flagged: false,
    },
    {
      new: true,
      runValidators: true,
    }
  )
  res.status(StatusCodes.OK).json({
    msg: `Message removed from flagged`,
  })
}

module.exports = {
  addMessage,
  deleteMessage,
  getAllPersonalMessages,
  getAllMessages,
  getAllArchivedMessages,
  getAllFlaggedMessages,
  getAllFavoriteMessages,
  addToFavourite,
  addToArchive,
  addToFlagged,
  removeFromFavourite,
  removeFromArchive,
  removeFromFlagged,
  clearAllPersonalMessages,
}
