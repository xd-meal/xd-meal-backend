'use strict';
const HttpError = require('../helper/error');
const Controller = require('egg').Controller;
const filterParams = require('../helper/filter');

const createRule = {
  username: 'string',
  password: { type: 'string', required: false },
  psw_salt: { type: 'string', required: false },
  email: { type: 'string', required: false },
  avatar: { type: 'string', required: false },
  role: { type: 'enum', values: [ 0, 1, 2 ], required: true },
  department: { type: 'string', required: true },
};

const editRule = {
  username: { type: 'string', required: false },
  password: { type: 'string', required: false },
  email: { type: 'string', required: false },
  avatar: { type: 'string', required: false },
  role: { type: 'enum', values: [ 0, 1, 2 ], required: false },
  department: { type: 'string', required: false },
};

const loginRule = {
  email: 'string',
  password: 'string',
};

const weworkRule = {
  corp: 'string',
  code: 'string',
};

class UsersController extends Controller {
  async login() {
    const ctx = this.ctx;
    const userService = ctx.service.users;
    if (userService.isLoggedIn()) {
      throw new HttpError({
        code: 403,
        msg: '已登录',
      });
    }
    const params = filterParams(ctx.request.body, createRule);
    ctx.validate(loginRule, params);
    const user = await userService.passwordLogin(params);
    if (!user) {
      throw new HttpError({
        code: 403,
        msg: '用户名或密码无效',
      });
    }
    ctx.session.user = user;
    ctx.body = { code: 0, msg: '登录成功' };
  }

  async logout() {
    const ctx = this.ctx;
    if (ctx.session.user) {
      ctx.session.user = undefined;
      ctx.body = { code: 0, msg: '登出成功' };
    } else {
      throw new HttpError({
        code: 403,
        msg: '尚未登录',
      });
    }
  }

  async wework() {
    const ctx = this.ctx;
    const userService = ctx.service.users;
    if (userService.isLoggedIn()) {
      throw new HttpError({
        code: 403,
        msg: '已登录',
      });
    }
    const params = filterParams(ctx.request.body, weworkRule);
    if (!this.config.wework || !this.config.wework.accessToken || !this.config.wework.accessToken[params.corp]) {
      throw new HttpError({
        code: 403,
        msg: '未配置企业微信或请求无效',
      });
    }
    const accessToken = this.config.wework.accessToken[params.corp];
    const result = await ctx.curl('https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=' + accessToken + '&code=' + params.code);
    if (!result.data.errcode && result.data.UserId) {
      const userid = result.data.UserId;
      const user = await userService.weworkLogin(userid, params.corp);
      if (!user) {
        // Create user by wework
      }
      ctx.session.user = user;
      ctx.body = {
        code: 200,
        msg: '登录成功',
      };
    } else if (!result.data.errcode && result.data.OpenId) {
      ctx.body = { code: -1, msg: 'user not corp member' };
    } else {
      ctx.body = JSON.parse(result.data);
    }

  }
}

module.exports = UsersController;
