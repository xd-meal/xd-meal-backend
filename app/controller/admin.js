'use strict';
const HttpError = require('../helper/error');
const Controller = require('egg').Controller;
const filterParams = require('../helper/filter');

const userImportRule = {
  list: {
    type: 'array',
    itemType: 'object',
    rule: {
      username: 'string',
      department: 'string',
      corp: 'string',
      email: 'string',
    },
  },
};
// {
//   type: 'array',
//     itemType: {
//   type: 'object',
// },
//   rule: {
//     username: 'string',
//       department: 'string',
//       corp: 'string',
//   },
// },

class UsersController extends Controller {
  async userList() {
    const ctx = this.ctx;
    const userService = ctx.service.users;
    const params = filterParams(ctx.request.body, userImportRule);
    ctx.validate(userImportRule, params);
    this.ctx.body = await userService.updateList(params.list);
  }
}

module.exports = UsersController;
