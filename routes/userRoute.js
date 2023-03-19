const express = require('express')
const UserRoute = express.Router()
const {
  getAllUsers,
  makeAdmin,
  verifyUser,
  userSuspension,
  banUser,
  editProfile,
  getProfile,
} = require('../controllers/userController')
const {
  authorization,
  authorizeAccess,
} = require('../middlewares/authorization')

UserRoute.route('/').get(authorization, authorizeAccess('admin'), getAllUsers)
UserRoute.route('/editProfile').patch(authorization, editProfile)
UserRoute.route('/getProfile').get(authorization, getProfile)
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
