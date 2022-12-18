const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
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
    passwordRecovery: {
        type: String,
    },
    bookmarks: {
        type: Array,
        ref: 'Bookmark',
    },
    reports: [{
        type: mongoose.Types.ObjectId,
    }, ],
}, {
    timestamps: true,
})

UserSchema.pre('save', async function() {
    if (!this.isModified('password')) return
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function(password) {
    const checkPassword = await bcrypt.compare(password, this.password)
    return checkPassword
}

UserSchema.pre('remove', async function() {
    if (this.banned) {
        await this.model('PersonalMessage').deleteMany({
            receiver: this._id,
        })
        await this.model('GroupMessage').deleteMany({
            createdBy: this._id,
        })
    }
})

UserSchema.statics.userSuspension = async function() {
    const userID = this._id
    const timeDuration = 3 * (1000 * 60 * 60 * 24)
    const totalDuration = new Date(Date.now() + timeDuration).getTime()
    const presentDay = new Date(Date.now()).getTime()
    try {
        if (this.role !== 'admin' && this.reports.length > 3) {
            const updatedUser = await this.model('User').findOneAndUpdate({
                _id: userID,
            }, {
                suspended: true,
                suspensionDuration: totalDuration,
            }, {
                new: true,
                runValidators: true,
            })
            if (presentDay > updatedUser.suspensionDuration) {
                await this.model('User').findOneAndUpdate({
                    _id: userID,
                }, {
                    suspended: false,
                    reports: [],
                }, {
                    new: true,
                    runValidators: true,
                })
            }
        }
    } catch (error) {
        console.log(error)
    }
}

UserSchema.post('save', async function() {
    await this.constructor.userSuspension()
})

module.exports = mongoose.model('User', UserSchema)