const Group = require('../models/groupMsgModel')
const User = require('../models/userModel')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors/index')
let uniqid = require('uniqid')
const { checkUser, allowAccess } = require('../middlewares/authorization')
const path = require('path')
const fs = require('fs')
const cloudinary = require('cloudinary').v2

const getGroups = async (req, res) => {
  const userID = req.user.userID
  const { search } = req.query
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 12
  const skip = (page - 1) * limit

  const cluster = await Group.find({
    createdBy: userID,
    name: {
      $regex: search || '',
      $options: 'i',
    },
  }).select('-messages')
  // .limit(limit)
  // .skip(skip)
  res.status(StatusCodes.OK).json({
    cluster,
    count: cluster.length,
  })
}

const clearAllGroups = async (req, res) => {
  const userID = req.user.userID
  await Group.deleteMany({
    createdBy: userID,
  })
  res.status(StatusCodes.OK).json({
    msg: `All groups cleared successfully`,
  })
}

const createGroup = async (req, res) => {
  const userID = req.user.userID
  let { name, description, image } = req.body
  if (!name || !description)
    throw new CustomError.BadRequestError(
      `Group name and description needs to be provided`
    )
  const spaceExist = await Group.findOne({
    name,
    createdBy: userID,
  })
  if (spaceExist)
    throw new CustomError.BadRequestError(`Group with this name already exist`)
  const space = await Group.create({
    createdBy: userID,
    name,
    description,
    image,
  })
  res.status(StatusCodes.OK).json({ space })
}

const deleteGroup = async (req, res) => {
  const userID = req.user.userID
  const { id } = req.params
  const spaceExist = await Group.findOne({
    createdBy: userID,
    _id: id,
  })
  if (!spaceExist) throw new CustomError.BadRequestError(`Group does not exist`)
  const space = await Group.findOneAndDelete({
    _id: id,
    createdBy: userID,
  })
  res.status(StatusCodes.OK).json({
    msg: `Space removed successfully!`,
  })
}

const getSingleGroup = async (req, res) => {
  const userID = req.user.userID
  const { id } = req.params
  const spaceExist = await Group.findOne({
    createdBy: userID,
    _id: id,
  })
  if (!spaceExist) throw new CustomError.BadRequestError(`Group does not exist`)
  const group = await Group.findOne({
    _id: id,
    createdBy: userID,
  })
  res.status(StatusCodes.OK).json({ group })
}

const editGroup = async (req, res) => {
  const userID = req.user.userID
  const { id } = req.params
  const spaceExist = await Group.findOne({
    createdBy: userID,
    _id: id,
  })
  if (!spaceExist) throw new CustomError.BadRequestError(`Space does not exist`)
  const space = await Group.findOneAndUpdate(
    {
      createdBy: userID,
      _id: id,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )
  res.status(StatusCodes.OK).json({
    msg: `Group updated successfully!`,
  })
}

const uploadGroupImage = async (req, res) => {
  const imageFile = req.files.image
  const image = await cloudinary.uploader.upload(imageFile.tempFilePath, {
    use_filename: true,
    folder: 'writeme',
  })
  fs.unlinkSync(imageFile.tempFilePath)
  if (!image) throw new CustomError.BadRequestError('No file found')
  res.status(StatusCodes.OK).json({
    image: {
      url: image.secure_url,
    },
  })
}

module.exports = {
  getGroups,
  editGroup,
  getSingleGroup,
  createGroup,
  deleteGroup,
  clearAllGroups,
  uploadGroupImage,
}
