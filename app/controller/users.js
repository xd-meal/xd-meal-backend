'use strict';

const Controller = require('egg').Controller;
const createRule = {
  username: 'string',
  password: 'string',
  email: { type: 'string', required: false },
  avatar: { type: 'string', required: false },
  role: { type: 'enum', values: [ 0, 1, 2 ], required: false },
  department: { type: 'string', required: false },
};

const editRule = createRule;

class UsersController extends Controller {
  login() {
    const app = this.ctx.app;
    const option = {
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
    };
    const token = app.jwt.sign(option, app.config.jwt.secret);
    this.ctx.body = { token };
  }
  async index() {
    const ctx = this.ctx;
    ctx.body = await ctx.service.users.list();
  }
  //
  async create() {
    const ctx = this.ctx;
    const userService = ctx.service.users;
    const params = userService.filterParams(ctx.request.body, createRule);
    ctx.validate(createRule, params);
    ctx.body = await userService.create(params);
  }
  //
  // async show(){
  //
  // }
  //
  async edit() {
    const ctx = this.ctx;
    ctx.validate(editRule);
    ctx.body = await ctx.service.users.update(ctx.request.body);
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
