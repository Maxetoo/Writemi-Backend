const mongoose = require('mongoose')

const singleGroupSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, 'Please input your message'],
      minLength: 5,
      maxLength: 300,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
    },
    source: {
      required: true,
      ref: 'GroupMessage',
      type: mongoose.Types.ObjectId,
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    reports: [
      {
        type: mongoose.Types.ObjectId,
      },
    ],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('SingleGroupMessage', singleGroupSchema)
