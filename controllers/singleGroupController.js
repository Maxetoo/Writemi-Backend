const CustomError = require('../errors')
const Group = require('../models/groupMsgModel')
const SingleGroup = require('../models/singleGroupModel')
const { StatusCodes } = require('http-status-codes')

const createGroupMessage = async (req, res) => {
  const { id } = req.params
  const { message } = req.body
  if (!message) throw new CustomError.BadRequestError(`Please type something`)
  const groupExist = await Group.find({
    _id: id,
  })
  if (!groupExist)
    throw new CustomError.BadRequestError(`Group with id: ${id} does not exist`)
  await SingleGroup.create({
    message,
    source: id,
  })
  res.status(StatusCodes.OK).json({
    msg: `Message sent to group`,
  })
}

const getGroupMessages = async (req, res) => {
  const { id } = req.params
  const { search } = req.query
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 7
  const skip = (page - 1) * limit
  const total = await SingleGroup.countDocuments({
    source: id,
  })
  const groupExist = await Group.find({
    _id: id,
  })
  if (!groupExist)
    throw new CustomError.BadRequestError(`Group with id: ${id} does not exist`)

  const messages = await SingleGroup.find({
    source: id,
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

const reportMessage = async (req, res) => {
  const { id } = req.params
  const userID = req.user.userID
  let users
  if (!req.user)
    throw new CustomError.BadRequestError(`Please login to report message`)
  const groupMessage = await SingleGroup.findOne({
    _id: id,
  })
  if (!groupMessage)
    throw new CustomError.BadRequestError(
      `Group message with id: ${id} does not exist`
    )
  const reports = groupMessage.reports
  const findReport = reports.find(
    (value) => value.toString() === userID.toString()
  )
  if (findReport)
    throw new CustomError.BadRequestError(`Message already flagged`)

  reports.push(userID)
  await groupMessage.save()

  res.status(StatusCodes.OK).json({
    msg: `Message flagged successfully`,
  })
}

const getFlaggedMessages = async (req, res) => {
  const { id } = req.params
  const messages = await SingleGroup.findOne({
    _id: id,
  })
  if (!messages)
    throw new CustomError.BadRequestError(
      `Group message with id: ${id} does not exist`
    )
  const reports = messages.reports
  res.status(StatusCodes.OK).json({
    reports,
  })
}

module.exports = {
  createGroupMessage,
  getGroupMessages,
  reportMessage,
  getFlaggedMessages,
}
