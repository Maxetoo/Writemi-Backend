const User = require('../models/userModel')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors/index')
const { createCookie } = require('../services/helpers')
let uniqid = require('uniqid')
const { generateNums } = require('../services/random')
const nodeMailer = require('nodemailer')

const register = async (req, res) => {
  const { username, email, password } = req.body
  if (!username || !email || !password)
    throw new CustomError.BadRequestError('Please fill up all credentails')
  const findUserEmail = await User.findOne({ email })
  const findUser = await User.findOne({ username })
  if (findUserEmail) {
    throw new CustomError.BadRequestError('Email already exist')
  }
  if (findUser) {
    throw new CustomError.BadRequestError('Username already taken')
  }
  const isAdmin = (await User.countDocuments({})) === 0 ? 'admin' : 'user'
  const user = await User.create({
    username,
    email,
    password,
    role: isAdmin,
  })
  res.cookie('token', 'register', {
    expires: new Date(Date.now()),
    httpOnly: true,
  })
  res.status(StatusCodes.CREATED).json({
    user,
  })
}

const login = async (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    throw new CustomError.BadRequestError('Please fill up all credentails')
  const user = await User.findOne({ username })
  if (!user) throw new CustomError.BadRequestError(`invalid username`)
  const checkPassword = await user.comparePassword(password)
  if (!checkPassword) throw new CustomError.BadRequestError(`Invalid password`)
  const { suspended, banned } = user
  if (suspended)
    throw new CustomError.BadRequestError(`Account is currently suspended`)
  if (banned) throw new CustomError.BadRequestError(`Account banned`)
  const token = {
    user: user.username,
    role: user.role,
    userID: user._id,
  }
  createCookie(res, token);
  //test cookie 
  res.cookie('logincookie-test', 'yo, this is some cookie');
  res.status(StatusCodes.OK).json({
    user,
    msg: 'should now have a cookie',
  })
}

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    expires: new Date(Date.now()),
    httpOnly: true,
  })
  res.status(StatusCodes.OK).json({
    msg: `User logged out successfully`,
  })
}

const forgotPassword = async (req, res) => {
  const OTP = generateNums()
  const { email } = req.body
  if (!email) throw new CustomError.BadRequestError('Please input email')
  const user = await User.findOne({
    email,
  })

  if (!user) throw new CustomError.BadRequestError(`Invalid email address!`)

  let transporter = nodeMailer.createTransport({
    host: 'smtp.zoho.com',
    secure: true,
    port: 465,
    auth: {
      user: 'maxeto@zohomail.com',
      pass: '6aV1jeueS92E',
    },
  })

  const mailOptions = {
    from: 'writee.mi.only@gmail.com', // sender address
    to: `${user.email}`,
    subject: 'Password Reset', // Subject line
    html: `
    <!doctype html>
<html lang="en-US">

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Reset Password Email Template</title>
    <meta name="description" content="Reset Password Email Template.">
    <style type="text/css">
        a:hover {text-decoration: underline !important;}
    </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
    <!--100% body table-->
    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                          <a href="#" title="Writeme" target="_blank">
                            <img width="60" src="https://res.cloudinary.com/dfamily/image/upload/v1679718679/writeme/tmp-1-1679718678399_pqb7a6.png" title="Writeme" alt="Writeme">
                          </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;">
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Reset Password</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            Hello ${user.username}, Thank you for choosing Writeme. Your reset password OTP is down below
                                        </p>
                                        <h1 style="color:#ffffff; font-weight:500; margin:2rem;font-size:32px;font-family:'Rubik',sans-serif;">${OTP}</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr> 
    </table>
    <!--/100% body table-->
</body>

</html>`, // plain text body
  }

  await transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err)
    }
  })

  user.resetToken = OTP
  await user.save()

  const finalDate = 20 * (1000 * 60)
  res.cookie('validEmail', uniqid(), {
    httpOnly: true,
    expires: new Date(Date.now() + finalDate),
    signed: true,
    secure: process.env.NODE_ENV === 'production',
    // sameSite: process.env.NODE_ENV === 'development' ? true : 'None',
    SameSite: 'None',
  })

  res.status(StatusCodes.OK).json({
    msg: `Token sent to ${user.email}`,
  })
}

const confirmToken = async (req, res) => {
  const { token } = req.body
  if (!token) throw new CustomError.BadRequestError(`OTP needs to be provided`)

  const user = await User.findOne({
    resetToken: token,
  })

  if (!user) throw new CustomError.BadRequestError(`Invalid token`)

  const finalDate = 20 * (1000 * 60)

  res.cookie('validToken', user.username, {
    httpOnly: true,
    expires: new Date(Date.now() + finalDate),
    signed: true,
    secure: process.env.NODE_ENV === 'production',
    // sameSite: process.env.NODE_ENV === 'development' ? true : 'None',
    SameSite: 'None',
  })

  res.status(StatusCodes.OK).json({
    msg: `Token correct`,
  })
}

const changePassword = async (req, res) => {
  const getUser = req.token
  const { password, confirmPassword } = req.body
  if (!password || !confirmPassword)
    throw new CustomError.BadRequestError('Please fill up passwords')

  if (password !== confirmPassword)
    throw new CustomError.BadRequestError('Passwords need to match')

  const user = await User.findOne({ username: getUser })

  user.password = password
  user.resetToken = ''

  await user.save()

  res.cookie('validEmail', 'wipeout', {
    expires: new Date(Date.now()),
    httpOnly: true,
  })

  res.cookie('validToken', 'wipeout', {
    expires: new Date(Date.now()),
    httpOnly: true,
  })

  res.status(StatusCodes.OK).json({ msg: `Reset password successful` })
}

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  confirmToken,
  changePassword,
}
