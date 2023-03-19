const User = require('../models/userModel')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors/index')
const { createCookie } = require('../services/helpers')
let uniqid = require('uniqid')
const register = async (req, res) => {
  const { username, email, password } = req.body
  if (!username || !email || !password)
    throw new CustomError.BadRequestError('Please fill up all credentails')
  const findUserEmail = await User.findOne({ email })
  const findUser = await User.findOne({ username })
  if (findUserEmail) {
    throw new CustomError.BadRequestError('Email already exist')
  }
  if (findUser) {
    throw new CustomError.BadRequestError('Username already taken')
  }
  const isAdmin = (await User.countDocuments({})) === 0 ? 'admin' : 'user'
  const user = await User.create({
    username,
    email,
    password,
    role: isAdmin,
  })
  res.cookie('token', 'register', {
    expires: new Date(Date.now()),
    httpOnly: true,
  })
  res.status(StatusCodes.CREATED).json({
    user,
  })
}

const login = async (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    throw new CustomError.BadRequestError('Please fill up all credentails')
  const user = await User.findOne({ username })
  if (!user) throw new CustomError.BadRequestError(`invalid username`)
  const checkPassword = await user.comparePassword(password)
  if (!checkPassword) throw new CustomError.BadRequestError(`Invalid password`)
  const { suspended, banned } = user
  if (suspended)
    throw new CustomError.BadRequestError(`Account is currently suspended`)
  if (banned) throw new CustomError.BadRequestError(`Account banned`)
  const token = {
    user: user.username,
    role: user.role,
    userID: user._id,
  }
  createCookie(res, token)
  res.status(StatusCodes.CREATED).json({
    user,
  })
}

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    expires: new Date(Date.now()),
    httpOnly: true,
  })
  res.status(StatusCodes.OK).json({
    msg: `User logged out successfully`,
  })
}

const addRecoveryPassword = async (req, res) => {
  const userID = req.user.userID
  let genKey = uniqid()
  const user = await User.findOneAndUpdate(
    {
      _id: userID,
    },
    {
      passwordRecovery: genKey,
    },
    {
      new: true,
      runValidators: true,
    }
  )
  res.status(StatusCodes.OK).json({
    msg: `Your recovery key is ${user.passwordRecovery}`,
  })
}

const forgotPassword = async (req, res) => {
  const { recoveryKey } = req.body
  if (!recoveryKey)
    throw new CustomError.BadRequestError('Please input recovery key')
  const user = await User.findOne({
    passwordRecovery: recoveryKey,
  })
  if (!user) throw new CustomError.BadRequestError('Invalid recovery key')
  const { suspended, banned } = user
  if (suspended)
    throw new CustomError.BadRequestError(`Account is currently suspended`)
  if (banned) throw new CustomError.BadRequestError(`Account banned`)
  const token = {
    user: user.username,
    role: user.role,
    userID: user._id,
  }
  createCookie(res, token)
  res.status(StatusCodes.CREATED).json({
    user,
  })
}

module.exports = {
  register,
  login,
  logout,
  addRecoveryPassword,
  forgotPassword,
}
