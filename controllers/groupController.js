const Group = require('../models/groupMsgModel')
const User = require('../models/userModel')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors/index')
let uniqid = require('uniqid')
const { checkUser, allowAccess } = require('../middlewares/authorization')

const getGroupClusters = async(req, res) => {
    const userID = req.user.userID
    const cluster = await Group.find({
        createdBy: userID,
    }).select('-messages')
    res.status(StatusCodes.OK).json({
        cluster,
    })
}

const createSpace = async(req, res) => {
    const userID = req.user.userID
    let { name, description, locked, passkey } = req.body
    passkey = uniqid().toString().slice(0, 5)
    if (!name)
        throw new CustomError.BadRequestError(`Space name needs to be provided`)
    if (locked && !passkey)
        throw new CustomError.BadRequestError(`Please fill in space key`)
    const spaceExist = await Group.findOne({
        name,
        createdBy: userID,
    })
    if (spaceExist)
        throw new CustomError.BadRequestError(`Space with this name already exist`)
    const space = await Group.create({
        createdBy: userID,
        name,
        description,
        locked,
        passkey,
    })
    res.status(StatusCodes.OK).json({ space })
}

const deleteSpace = async(req, res) => {
    const userID = req.user.userID
    const { id } = req.params
    const spaceExist = await Group.findOne({
        createdBy: userID,
        _id: id,
    })
    if (!spaceExist) throw new CustomError.BadRequestError(`Space does not exist`)
    const space = await Group.findOneAndDelete({
        _id: id,
        createdBy: userID,
    })
    res.status(StatusCodes.OK).json({
        msg: `Space removed successfully!`,
    })
}

const editSpace = async(req, res) => {
    const userID = req.user.userID
    const { id } = req.params
    const spaceExist = await Group.findOne({
        createdBy: userID,
        _id: id,
    })
    if (!spaceExist) throw new CustomError.BadRequestError(`Space does not exist`)
    const space = await Group.findOneAndUpdate({
            createdBy: userID,
            _id: id,
        },
        req.body, {
            new: true,
            runValidators: true,
        }
    )
    res.status(StatusCodes.OK).json({
        msg: `Space updated successfully!`,
    })
}

const addGroupMessage = async(req, res) => {
    const { id } = req.params
    const { message } = req.body

    if (!message) throw new CustomError.BadRequestError(`Please type something`)
    const groupIsMuted = await Group.findOne({
        _id: id,
        muted: true,
    })
    if (groupIsMuted)
        throw new CustomError.BadRequestError(
            'This space has been muted by the creator'
        )
    const group = await Group.findOneAndUpdate({
        _id: id,
    }, {
        $push: {
            messages: {
                message,
            },
        },
    })
    res.status(StatusCodes.OK).json({
        msg: `Message created successfully`,
    })
}

const getGroupMessages = async(req, res) => {
    const { id } = req.params
    const { passkey } = req.body
    const token = checkUser(req)
    const groupExist = await Group.findOne({
        _id: id,
    })
    if (!groupExist) throw new CustomError.NotFoundError(`Group does not exist`)
    const { locked, createdBy } = groupExist
    if (locked) {
        if (passkey) {
            if (token) {
                if (token.userID.toString() !== createdBy.toString()) {
                    if (groupExist.passkey !== passkey)
                        throw new CustomError.BadRequestError(`Incorrect passkey`)
                }
            } else {
                if (groupExist.passkey !== passkey)
                    throw new CustomError.BadRequestError(`Incorrect passkey`)
            }
        } else {
            throw new CustomError.BadRequestError('Please input passkey')
        }
    }
    if (!groupExist) throw new CustomError.NotFoundError(`Space do not exist`)
    const space = await Group.find({
        _id: id,
    }).select('messages -_id')
    res.status(StatusCodes.OK).json({
        space,
    })
}

const addGroupUpvote = async(req, res) => {
    const { id } = req.params
    const userID = req.user.userID
    let upvotesCount
    let users
    if (!req.user)
        throw new CustomError.BadRequestError(`Please login to add reaction`)

    const group = await Group.findOne({
        'messages._id': id,
    })
    if (!group)
        throw new CustomError.BadRequestError(`Id does not match any message`)
    const messages = group.messages
    for (const messageId of messages) {
        const getMessageId = messageId._id.toString()
        if (getMessageId === id) {
            const upvotePresent = messageId.upvotes.find(
                (value) => value._id.toString() === userID.toString()
            )
            if (upvotePresent) {
                messageId.upvotes.pop(userID)
            } else {
                messageId.upvotes.push(userID)
                messageId.downvotes.pop(userID)
            }
            users = messageId.upvotes
            upvotesCount = messageId.upvotes.length

            await group.save()
        }
    }
    res.status(StatusCodes.OK).json({
        users,
        upvotes: upvotesCount,
    })
}

const addGroupDownvote = async(req, res) => {
    const { id } = req.params
    const userID = req.user.userID
    let downvotesCount
    let users
    if (!req.user)
        throw new CustomError.BadRequestError(`Please login to add reaction`)

    const group = await Group.findOne({
        'messages._id': id,
    })

    if (!group)
        throw new CustomError.BadRequestError(`Id does not match any message`)
    const messages = group.messages
    for (const messageId of messages) {
        const getMessageId = messageId._id.toString()
        if (getMessageId === id) {
            const downvotePresent = messageId.downvotes.find(
                (value) => value._id.toString() === userID.toString()
            )
            if (downvotePresent) {
                messageId.downvotes.pop(userID)
            } else {
                messageId.downvotes.push(userID)
                messageId.upvotes.pop(userID)
            }
            users = messageId.downvotes
            downvotesCount = messageId.downvotes.length
            await group.save()
        }
    }
    res.status(StatusCodes.OK).json({
        users,
        downvotes: downvotesCount,
    })
}

const reportUserMessage = async(req, res) => {
    const { id } = req.params
    const userID = req.user.userID
    let reports
    let users
    if (!req.user)
        throw new CustomError.BadRequestError(`Please login to report message`)
    const group = await Group.findOne({
        'messages._id': id,
    })
    if (!group)
        throw new CustomError.BadRequestError(`Id does not match any message`)
    const messages = group.messages
    for (const reportId of messages) {
        const getReportId = reportId._id.toString()
        if (getReportId === id) {
            const reportPresent = reportId.reports.find(
                (value) => value.toString() === userID.toString()
            )
            if (!reportPresent) {
                reportId.reports.push(userID)
            }
            reports = reportId.reports
            users = reportId.reports.length
            const user = await User.findOne({
                _id: userID,
            })
            if (user && !user.suspended && !user.banned) {
                await User.findOneAndUpdate({
                    _id: userID,
                }, {
                    reports,
                }, {
                    new: true,
                    runValidators: true,
                })
            }
            await group.save()
        }
    }
    res.status(StatusCodes.OK).json({
        reports,
        counts: users,
    })
}

module.exports = {
    getGroupClusters,
    createSpace,
    deleteSpace,
    editSpace,
    addGroupMessage,
    getGroupMessages,
    addGroupUpvote,
    addGroupDownvote,
    reportUserMessage,
}