const express = require('express')
const GroupRoute = express.Router()
const {
  // getGroupClusters,
  // createSpace,
  // deleteSpace,
  // editSpace,
  // getSingleSpace,
  // addGroupMessage,
  // getGroupMessages,
  // addGroupUpvote,
  // addGroupDownvote,
  // reportUserMessage,
  uploadGroupImage,
  getGroups,
  getSingleGroup,
  createGroup,
  clearAllGroups,
  deleteGroup,
  editGroup,
} = require('../controllers/groupController')

const {
  authorization,
  authorizeAccess,
} = require('../middlewares/authorization')

GroupRoute.route('/').get(authorization, getGroups)
GroupRoute.route('/space').post(authorization, createGroup)
GroupRoute.route('/space/clearSpaces').delete(authorization, clearAllGroups)
GroupRoute.route('/space/uploadImage').post(authorization, uploadGroupImage)
GroupRoute.route('/space/:id')
  .patch(authorization, editGroup)
  .delete(authorization, deleteGroup)
GroupRoute.route('/getGroup/:id').get(authorization, getSingleGroup)

module.exports = GroupRoute
