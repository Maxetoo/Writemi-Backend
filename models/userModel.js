const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please input username'],
      minLength: 3,
      maxLength: 11,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please input password'],
      minLength: 5,
    },
    email: {
      type: String,
      required: [true, 'Please input valid email'],
      validate: {
        validator: validator.isEmail,
        message: (props) => `${props.value} is not a valid email`,
      },
      unique: true,
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    suspended: {
      type: Boolean,
      default: false,
    },
    suspensionDuration: {
      type: String,
    },
    banned: {
      type: Boolean,
      default: false,
    },
    resetToken: {
      type: String,
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

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt()
  this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function (password) {
  const checkPassword = await bcrypt.compare(password, this.password)
  return checkPassword
}

UserSchema.pre('remove', async function () {
  if (this.banned) {
    await this.model('PersonalMessage').deleteMany({
      receiver: this._id,
    })
    await this.model('GroupMessage').deleteMany({
      createdBy: this._id,
    })
  }
})

UserSchema.index({ email: 1, username: 1 }, { unique: true })

module.exports = mongoose.model('User', UserSchema)
