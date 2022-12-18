const express = require('express')
const PersonalMsgRoute = express.Router()
const {
    addMessage,
    deleteMessage,
    getAllPersonalMessages,
    getAllMessages,
    getAllArchivedMessages,
    getAllFlaggedMessages,
    getAllFavoriteMessages,
    addToFavourite,
    addToArchive,
    addToFlagged,
    removeFromFavourite,
    removeFromArchive,
    removeFromFlagged,
} = require('../controllers/personalController')
const {
    authorization,
    authorizeAccess,
} = require('../middlewares/authorization')

PersonalMsgRoute.route('/').post(addMessage)
PersonalMsgRoute.route('/').get(authorization, getAllPersonalMessages)
PersonalMsgRoute.route('/allMessages').get(
    authorization,
    authorizeAccess('admin'),
    getAllMessages
)
PersonalMsgRoute.route('/archivedMessages').get(
    authorization,
    getAllArchivedMessages
)
PersonalMsgRoute.route('/flaggedMessages').get(
    authorization,
    getAllFlaggedMessages
)
PersonalMsgRoute.route('/favouriteMessages').get(
    authorization,
    getAllFavoriteMessages
)
PersonalMsgRoute.route('/addToFavourite/:id').patch(
    authorization,
    addToFavourite
)
PersonalMsgRoute.route('/addToArchive/:id').patch(authorization, addToArchive)
PersonalMsgRoute.route('/addToFlagged/:id').patch(authorization, addToFlagged)
PersonalMsgRoute.route('/removeFromFavourite/:id').patch(
    authorization,
    removeFromFavourite
)
PersonalMsgRoute.route('/removeFromArchive/:id').patch(
    authorization,
    removeFromArchive
)
PersonalMsgRoute.route('/removeFromFlagged/:id').patch(
    authorization,
    removeFromFlagged
)

PersonalMsgRoute.route('/:id').delete(authorization, deleteMessage)

module.exports = PersonalMsgRoute