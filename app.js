require('express-async-errors')
require('dotenv').config()
const express = require('express')
const app = express()
const fileUploader = require('express-fileupload')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const cloudinary = require('cloudinary').v2
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
})
const AuthRouter = require('./routes/authRoute')
const UserRouter = require('./routes/userRoute')
const PersonalMessageRouter = require('./routes/personalMsgRoute')
const GroupMessageRouter = require('./routes/groupMsgRoute')
const BookmarkRouter = require('./routes/bookmarkRoute')
const errorMiddleware = require('./middlewares/errorMiddleware')
const notFoundMiddleware = require('./middlewares/notFoundRoute')
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')

// middlewares
app.use(fileUploader({ useTempFiles: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser(process.env.COOKIE))
app.use(morgan('tiny'))
const allowlist = ['http://localhost:3000', 'http://example2.com']
const corsOptionsDelegate = function (req, callback) {
  var corsOptions
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

app.use(cors({ origin: 'http://localhost:3000' }))
app.use(helmet())

app.get('/', (req, res) => {
  res
    .status(200)
    .send(`<h1>Writemi Api</h1><a href="/api-docs">Documentation</a>`)
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/api/v1/auth', AuthRouter)
app.use('/api/v1/user', UserRouter)
app.use('/api/v1/personal', PersonalMessageRouter)
app.use('/api/v1/group', GroupMessageRouter)
app.use('/api/v1/bookmark', BookmarkRouter)
app.use(notFoundMiddleware)
app.use(errorMiddleware)
const port = process.env.PORT || 5000

const startApp = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL)
    app.listen(port, console.log(`app is listening to port ${port}...`))
  } catch (error) {
    console.log(error.message)
  }
}

startApp()
