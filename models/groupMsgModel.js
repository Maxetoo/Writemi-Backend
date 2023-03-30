const mongoose = require('mongoose')

// const UpvoteSchema = new mongoose.Schema({
//   counts: {
//     type: mongoose.Types.ObjectId,
//   },
// })

// const DownvoteSchema = new mongoose.Schema({
//   counts: {
//     type: mongoose.Types.ObjectId,
//   },
// })

// const MessageSchema = mongoose.Schema(
//   {
//     message: {
//       type: String,
//       required: [true, 'Please input your message'],
//       minLength: 5,
//       maxLength: 250,
//     },
//     createdBy: {
//       type: mongoose.Types.ObjectId,
//     },
//     flagged: {
//       type: Boolean,
//       default: false,
//     },
//     upvotes: [UpvoteSchema],
//     downvotes: [DownvoteSchema],
//     reports: [
//       {
//         type: mongoose.Types.ObjectId,
//       },
//     ],
//     bookmarks: [
//       {
//         type: mongoose.Types.ObjectId,
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// )

const groupClusterSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    image: {
      type: String,
      default:
        'https://ouch-cdn2.icons8.com/S07cWPmLAvXHhTADC95jExsKeh9oXk_4noCrCoSfZZY/rs:fit:256:256/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvNTg1/LzFjYWI0MDMwLWNm/N2EtNGU0Zi1hNThm/LTYxMzUxZmVkZTFm/NS5zdmc.png',
    },
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 15,
      trim: true,
    },
    description: {
      type: String,
      minLength: 3,
    },
    muted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

groupClusterSchema.index({ createdBy: 1, name: 1 }, { unique: true })

module.exports = mongoose.model('GroupMessage', groupClusterSchema)
