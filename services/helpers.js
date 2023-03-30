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
    expires: new Date(Date.now() + finalDate),
    signed: true,
    secure: process.env.NODE_ENV === 'production',
    // sameSite: process.env.NODE_ENV === 'development' ? true : 'None',
    SameSite: 'None',
  })
}

module.exports = {
  verifyJwt,
  createCookie,
}
