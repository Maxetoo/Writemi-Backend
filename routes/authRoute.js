const express = require('express')
const AuthRoute = express.Router()
const {
    register,
    login,
    logout,
    addRecoveryPassword,
    forgotPassword,
} = require('../controllers/authController')
const { authorization } = require('../middlewares/authorization')
AuthRoute.route('/register').post(register)
AuthRoute.route('/login').post(login)
AuthRoute.route('/logout').post(logout)
AuthRoute.route('/addPasswordRecovery').patch(
    authorization,
    addRecoveryPassword
)
AuthRoute.route('/forgotPassword').post(forgotPassword)

module.exports = AuthRoute