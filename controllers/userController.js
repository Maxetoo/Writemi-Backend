const User = require('../models/userModel')
const CustomError = require('../errors/index')
const { StatusCodes } = require('http-status-codes')

const getAllUsers = async(req, res) => {
    const users = await User.find({})
    res.status(StatusCodes.OK).json({
        count: users.length,
    })
}

const makeAdmin = async(req, res) => {
    const { id } = req.params
    const user = await User.findOneAndUpdate({
        _id: id,
    }, {
        role: 'admin',
    }, {
        new: true,
        runValidators: true,
    })
    if (!user) {
        throw new CustomError.NotFoundError(`No user with id: ${id} found`)
    }

    res.status(StatusCodes.OK).json({ msg: `User updated to admin` })
}

const verifyUser = async(req, res) => {
    const { id } = req.params
    const user = await User.findOneAndUpdate({
        _id: id,
    }, {
        verified: true,
    }, {
        new: true,
        runValidators: true,
    })
    if (!user) {
        throw new CustomError.NotFoundError(`No user with id: ${id} found`)
    }

    res.status(StatusCodes.OK).json({ msg: `User verification successful` })
}

const userSuspension = async(req, res) => {
    const userID = req.user.userID
    const timeDuration = 3 * (1000 * 60 * 60 * 24)
    const totalDuration = new Date(Date.now() + timeDuration).getTime()
    const presentDay = new Date(Date.now()).getTime()
    const user = await User.findOne({
        _id: userID,
    })
    if (user.role !== 'admin' && user.reports.length > 3) {
        const updatedUser = await User.findOneAndUpdate({
            _id: userID,
        }, {
            suspended: true,
            suspensionDuration: totalDuration,
        }, {
            new: true,
            runValidators: true,
        })
        if (presentDay > updatedUser.suspensionDuration) {
            await User.findOneAndUpdate({
                _id: userID,
            }, {
                suspended: false,
                reports: [],
            }, {
                new: true,
                runValidators: true,
            })
        }
    }

    res.status(StatusCodes.OK).json({
        msg: `User status updated`,
    })
}

const banUser = async(req, res) => {
    const { id } = req.params
    const user = await User.findOneAndUpdate({
        _id: id,
    }, {
        banned: true,
    }, {
        new: true,
        runValidators: true,
    })
    if (!user) {
        throw new CustomError.NotFoundError(`No user with id: ${id} found`)
    }

    res.status(StatusCodes.OK).json({ msg: `User banned successfully` })
}

module.exports = {
    getAllUsers,
    makeAdmin,
    verifyUser,
    userSuspension,
    banUser,
}