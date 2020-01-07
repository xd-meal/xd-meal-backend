
const HttpError = require('../helper/error')

module.exports = async (ctx, next) => {
  if (ctx.session.user && ctx.session.user.username) {
    throw new HttpError({
      code: 403,
      msg: '老哥你不要搞事情啊'
    })
  }
  if (!ctx.app.config.pos.keys.includes(ctx.get('xd-meal-pos-auth'))) {
    throw new HttpError({
      code: 403,
      msg: '机端密钥与服务器不符'
    })
  } else {
    await next()
  }
}
