const BadRequestError = require('./Badrequest')
const NotFoundError = require('./Notfound')
const UnauthorizedError = require('./Unauthorised')

const CustomError = {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
}

module.exports = CustomError