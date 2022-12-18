const express = require('express')
const UserRoute = express.Router()
const {
    getAllUsers,
    makeAdmin,
    verifyUser,
    userSuspension,
    banUser,
} = require('../controllers/userController')
const {
    authorization,
    authorizeAccess,
} = require('../middlewares/authorization')

UserRoute.route('/').get(authorization, authorizeAccess('admin'), getAllUsers)
UserRoute.route('/userSuspension').patch(authorization, userSuspension)
UserRoute.route('/makeAdmin/:id').patch(
    authorization,
    authorizeAccess('admin'),
    makeAdmin
)
UserRoute.route('/verifyUser/:id').patch(
    authorization,
    authorizeAccess('admin'),
    verifyUser
)

UserRoute.route('/banUser/:id').patch(
    authorization,
    authorizeAccess('admin'),
    banUser
)

module.exports = UserRoute