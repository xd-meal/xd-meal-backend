'use strict';
const Controller = require('egg').Controller;
const filterParams = require('../helper/filter');
const loginRule = {
  email: 'string',
  password: 'string',
};
class UserController extends Controller {
  async sessionCheck() {
    const ctx = this.ctx;
    const userId = ctx.session.userId;
    if (userId) {
      this.ctx = {
        code: 1,
      };
    }
  }
  async login() {
    const ctx = this.ctx;
    const params = filterParams(ctx.request.body, loginRule);
    const userService = ctx.service.users;
    ctx.validate(loginRule, params);
    ctx.body = await userService.login(params);
  }
}

module.exports = UserController;
