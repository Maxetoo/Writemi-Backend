const express = require('express')
const GroupRoute = express.Router()
const {
  getGroupClusters,
  createSpace,
  deleteSpace,
  editSpace,
  addGroupMessage,
  getGroupMessages,
  addGroupUpvote,
  addGroupDownvote,
  reportUserMessage,
  uploadGroupImage,
} = require('../controllers/groupController')

const {
  authorization,
  authorizeAccess,
} = require('../middlewares/authorization')

GroupRoute.route('/').get(authorization, getGroupClusters)
GroupRoute.route('/space').post(authorization, createSpace)
GroupRoute.route('/space/uploadImage').post(authorization, uploadGroupImage)
GroupRoute.route('/space/:id')
  .patch(authorization, editSpace)
  .delete(authorization, deleteSpace)
GroupRoute.route('/addMessage/:id').patch(addGroupMessage)
GroupRoute.route('/getMessage/:id').get(getGroupMessages)
GroupRoute.route('/addUpvote/:id').patch(authorization, addGroupUpvote)
GroupRoute.route('/addDownvote/:id').patch(authorization, addGroupDownvote)
GroupRoute.route('/reportMessage/:id').patch(authorization, reportUserMessage)

module.exports = GroupRoute
