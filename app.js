require('express-async-errors')
require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const AuthRouter = require('./routes/authRoute')
const UserRouter = require('./routes/userRoute')
const PersonalMessageRouter = require('./routes/personalMsgRoute')
const GroupMessageRouter = require('./routes/groupMsgRoute')
const BookmarkRouter = require('./routes/bookmarkRoute')
const errorMiddleware = require('./middlewares/errorMiddleware')
const notFoundMiddleware = require('./middlewares/notFoundRoute')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser(process.env.COOKIE))
app.use(morgan('tiny'))
app.use(cors())
app.use(helmet())
app.use('/api/v1/auth', AuthRouter)
app.use('/api/v1/user', UserRouter)
app.use('/api/v1/personal', PersonalMessageRouter)
app.use('/api/v1/group', GroupMessageRouter)
app.use('/api/v1/bookmark', BookmarkRouter)
app.use(notFoundMiddleware)
app.use(errorMiddleware)
const port = process.env.PORT || 5000

const startApp = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        app.listen(port, console.log(`app is listening to port ${port}...`))
    } catch (error) {
        console.log(error.message)
    }
}

// {
//     "username": "maxeto",
//     "email": "maxeto@gmail.com",
//     "password": "maxeto123"

// }

startApp()