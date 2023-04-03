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
    httpOnly: true,
    domain: 'http://writemi-frontend.vercel.app',
    expires: new Date(Date.now() + finalDate),
    signed: true,
    secure: false,
    sameSite: 'None',
  })
}

module.exports = {
  verifyJwt,
  createCookie,
}
