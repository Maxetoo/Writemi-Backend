const express = require('express')
const SingleGroupRoute = express.Router()
const { authorization } = require('../middlewares/authorization')
const {
  createGroupMessage,
  getGroupMessages,
  reportMessage,
  getFlaggedMessages,
} = require('../controllers/singleGroupController')

SingleGroupRoute.route('/addMessage/:id').post(
  authorization,
  createGroupMessage
)
SingleGroupRoute.route('/getMessages/:id').get(getGroupMessages)
SingleGroupRoute.route('/reportMessage/:id').patch(authorization, reportMessage)
SingleGroupRoute.route('/getReports/:id').get(authorization, getFlaggedMessages)

module.exports = SingleGroupRoute
