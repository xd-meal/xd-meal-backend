'use strict';
const HttpError = require('../helper/error');
const Controller = require('egg').Controller;
const filterParams = require('../helper/filter');

const createRule = {
  username: 'string',
  password: 'string',
  email: { type: 'string', required: false },
  avatar: { type: 'string', required: false },
  role: { type: 'enum', values: [ 0, 1, 2 ], required: false },
  department: { type: 'string', required: false },
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

class UsersController extends Controller {
  async login() {
    const ctx = this.ctx;
    const app = ctx.app;
    const userService = ctx.service.users;
    const params = filterParams(ctx.request.body, createRule);
    ctx.validate(loginRule, params);
    const user = await userService.checkLogin(params);
    if (!user) {
      throw new HttpError({
        code: 403,
        msg: '用户名或密码无效',
      });
    }
    const option = {
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
    };
    option.sub = user._id;
    option.iss = 'xdmeal_normal';
    const token = app.jwt.sign(option, app.config.jwt.secret);
    this.ctx.body = { token };
  }
  async index() {
    const ctx = this.ctx;
    ctx.service.users.isAdmin();
    ctx.body = await ctx.service.users.list();
  }
  //
  async create() {
    const ctx = this.ctx;
    const userService = ctx.service.users;
    await userService.isAdmin();
    const params = filterParams(ctx.request.body, createRule);
    ctx.validate(createRule, params);
    ctx.body = await userService.create(params);
  }
  //
  // async show(){
  //
  // }
  //
  async update() {
    const ctx = this.ctx;
    // const userService = ctx.service.users;
    ctx.validate(editRule);
    const params = filterParams(ctx.request.body, editRule);
    const id = ctx.params.id;
    if (!id) {
      // || Object.keys(params).length === 0) {
      throw new HttpError({
        code: 422,
        msg: 'Unprocessable Entity',
      });
    }
    ctx.body = await ctx.service.users.update(params, id);
  }
  //
  // async update() {
  //
  // }
  //
  // async destroy() {
  //
  // }
}

module.exports = UsersController;
