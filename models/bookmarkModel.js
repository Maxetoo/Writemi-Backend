const mongoose = require('mongoose')

const BookmarkModel = new mongoose.Schema(
  {
    source: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

BookmarkModel.post('save', async function () {
  // await this.update({
  //   _id: this.source
  // }, {
  //   $pull: {
  //   }
  // })
})

module.exports = mongoose.model('Bookmarks', BookmarkModel)
