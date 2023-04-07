const jwt = require('jsonwebtoken')

const createJwt = (payload) => {
  return jwt.sign({ payload }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFESPAN,
  })
}

const verifyJwt = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

const createCookie = (res, token) => {
  const userToken = createJwt(token)
  const finalDate = 7 * (1000 * 60 * 60 * 24)
  return res.cookie('token', userToken, {
    httpOnly: false,
    expires: new Date(Date.now() + finalDate),
    signed: true,
    secure: true,
    // sameSite: 'strict',
  })
}

module.exports = {
  verifyJwt,
  createCookie,
}
