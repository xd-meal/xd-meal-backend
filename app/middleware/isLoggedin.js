
const HttpError = require('../helper/error')

module.exports = async (ctx, next) => {
  if (!ctx.session.user) {
    ctx.cookies.set('XD-MEAL-SESSION', 0, {
      expires: 'Thu, 01 Jan 1970 00:00:00 UTC'
    })
    throw new HttpError({
      code: 403,
      msg: '尚未登录'
    })
  } else {
    await next()
  }
}
