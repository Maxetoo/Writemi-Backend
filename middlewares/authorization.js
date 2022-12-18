const { verifyJwt } = require('../services/helpers')
const CustomError = require('../errors')

const authorization = (req, res, next) => {
    const getToken = req.signedCookies.token
    if (!getToken) throw new CustomError.UnauthorizedError('Not authorised')
    const user = verifyJwt(getToken).payload
    req.user = user
    next()
}

const checkUser = (req) => {
    const getToken = req.signedCookies.token
    if (!getToken) {
        return false
    } else {
        const user = verifyJwt(getToken).payload
        return user
    }
}

const authorizeAccess = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new CustomError.UnauthorizedError(`Not authorised`)
        }
        next()
    }
}

const confirmUser = (req, user) => {
    if (req.user.userID !== user.toString())
        throw new CustomError.UnauthorizedError(`Not authorised`)
}

const allowAccess = (req, userAuth) => {
    const user = req.user.userID
    const role = req.user.role
    if (role === 'admin') return
    if (user === userAuth.toString()) return
    throw new CustomError.UnauthorizedError('Unauthorized Error')
}

module.exports = {
    authorization,
    authorizeAccess,
    confirmUser,
    checkUser,
    allowAccess,
}