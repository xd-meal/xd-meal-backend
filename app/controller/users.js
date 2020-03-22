
const HttpError = require('../helper/error')
const Controller = require('egg').Controller
const filterParams = require('../helper/filter')

const createRule = {
  username: 'string',
  password: { type: 'string', required: false },
  psw_salt: { type: 'string', required: false },
  email: { type: 'string', required: false },
  avatar: { type: 'string', required: false },
  role: { type: 'enum', values: [0, 1, 2], required: true },
  department: { type: 'string', required: true }
}

const loginRule = {
  email: 'string',
  password: 'string'
}

const weworkRule = {
  corp: 'string',
  code: 'string'
}

const configRule = {
  advance: 'bool',
  randomBtn: 'bool',
  buffetBtn: 'bool',
  randomForNoSpicy: 'bool',
  randomForEmpty: 'bool'
}

const resetPswRule = {
  oldPsw: 'string',
  newPsw: {
    type: 'string',
    max: 22,
    min: 8,
    trim: true
  }
}

class UsersController extends Controller {
  async login () {
    const ctx = this.ctx
    const userService = ctx.service.users
    if (userService.isLoggedIn()) {
      ctx.body = { code: 0, msg: '登录成功' }
      return
    }
    const params = filterParams(ctx.request.body, createRule)
    ctx.validate(loginRule, params)
    const user = await userService.passwordLogin(params)
    if (!user) {
      throw new HttpError({
        code: 403,
        msg: '用户名或密码无效'
      })
    }
    ctx.body = { code: 0, msg: '登录成功' }
  }

  async logout () {
    const ctx = this.ctx
    ctx.session.user = undefined
    ctx.cookies.set('XD-MEAL-SESSION', 0, {
      expires: 'Thu, 01 Jan 1970 00:00:00 UTC'
    })
    ctx.body = { code: 0, msg: '登出成功' }
  }

  async wework () {
    const ctx = this.ctx
    const userService = ctx.service.users
    const weworkService = ctx.service.wework
    const config = ctx.app.config
    if (userService.isLoggedIn()) {
      throw new HttpError({
        code: 403,
        msg: '已登录'
      })
    }
    const params = filterParams(ctx.request.query, weworkRule)
    if (!config.wework || !config.wework.secret || !config.wework.secret[params.corp]) {
      throw new HttpError({
        code: 403,
        msg: '未配置企业微信或请求无效'
      })
    }
    const userid = await weworkService.getUserID(params.code, params.corp)
    await userService.weworkLogin(userid, params.corp)
    ctx.body = {
      code: 200,
      msg: '登录成功'
    }
  }

  async userUpdateConfig () {
    const ctx = this.ctx
    const userService = ctx.service.users
    const params = filterParams(ctx.request.body, configRule)
    ctx.validate(configRule, params)
    userService.updateUserConfig(params)
    ctx.body = { code: 0, msg: '更新成功' }
  }

  async resetPsw () {
    const ctx = this.ctx
    const userService = ctx.service.users
    const params = filterParams(ctx.request.body, resetPswRule)
    ctx.validate(resetPswRule, params)
    const userId = userService.getCurrentUserId()
    const checkSuccess = await userService.validatePsw(params.oldPsw, {
      _id: userId
    })
    if (!checkSuccess) {
      throw new HttpError({
        code: 403,
        msg: '用户名密码错误'
      })
    }
    await userService.updatePsw(userId, params.newPsw)
    this.logout()
    ctx.body = { code: 0, msg: '更新成功，请重新登陆' }
  }

  async userProfile () {
    const ctx = this.ctx
    ctx.body = {
      avatar: '',
      config: {
        advance: false,
        randomBtn: false,
        buffetBtn: true
      },
      ...ctx.session.user
    }
  }
}

module.exports = UsersController
