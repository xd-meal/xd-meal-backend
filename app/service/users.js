'use strict';
const Service = require('egg').Service;
const HttpError = require('../helper/error');

const commonFilter = {
  _id: 0,
  __v: 0,
};

class UsersService extends Service {
  async create(params) {
    const ctx = this.ctx;
    // 用户名约束
    if (params.username.length >= 22) {
      throw new HttpError({
        code: 403,
        msg: '用户名长度必须为22字符以内',
      });
    }
    // 密码约束
    if (params.password.length < 8 || params.password.length >= 22) {
      throw new HttpError({
        code: 403,
        msg: '密码长度必须为8-21字符',
      });
    }
    // TODO: psw 需要掺最少 32位 salt 保存
    // TODO: psw 可以选用 Bcrypt 加密密码
    // TODO: 严格校验 psw 和 username
    // TODO: 严格校验 email 格式（如果有的话）
    return await ctx.model.User.create({
      ...params,
    });
  }

  async list() {
    const ctx = this.ctx;
    return await ctx.model.User.find({}, commonFilter).limit(2000);
  }

  filterParams(params, rule) {
    const keys = Object.keys(rule);
    const data = {};
    for (const key of keys) {
      if (params[key]) {
        data[key] = params[key];
      }
    }
    return data;
  }
}

module.exports = UsersService;
