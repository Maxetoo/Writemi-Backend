const express = require('express')
const AuthRoute = express.Router()
const {
  register,
  login,
  logout,
  forgotPassword,
  confirmToken,
  changePassword,
} = require('../controllers/authController')
const {
  authorization,
  resetOTPAuth,
  tokenIsValid,
} = require('../middlewares/authorization')
AuthRoute.route('/register').post(register)
AuthRoute.route('/login').post(login)
AuthRoute.route('/forgotPassword').post(forgotPassword)
AuthRoute.route('/confirmToken').post(resetOTPAuth, confirmToken)
AuthRoute.route('/changePassword').patch(tokenIsValid, changePassword)
AuthRoute.route('/logout').post(logout)

module.exports = AuthRoute
