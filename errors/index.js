const NotFoundError = require('./Notfound')
const BadRequestError = require('./BadRequest')
const UnauthorizedError = require('./Unauthorised')

const CustomError = {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
}

module.exports = CustomError