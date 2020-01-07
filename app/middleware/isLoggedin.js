
const HttpError = require('../helper/error')

module.exports = async (ctx, next) => {
  if (!ctx.session.user) {
    throw new HttpError({
      code: 403,
      msg: '尚未登录'
    })
  } else {
    await next()
  }
}
