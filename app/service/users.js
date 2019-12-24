'use strict';
const Service = require('egg').Service;
const HttpError = require('../helper/error');

const commonFilter = {
  __v: 0,
};

class UsersService extends Service {
  async checkLogin(params) {
    const ctx = this.ctx;
    let user = null;
    try {
      user = await ctx.model.User.findOne({
        email: params.email,
        password: params.password,
      });
    } catch (error) {
      console.log(error);
    }
    return user;
  }

  /**
   * @description 判断用户是否是admin，如果不是 admin 直接跑出异常并终止程序，调用时请注意
   * @return {Promise<void>} 无返回值
   */
  async isAdmin() {
    const ctx = this.ctx;
    const app = ctx.app;
    const parts = ctx.get('Authorization').split(' ');
    const data = app.jwt.decode(parts[1]);
    const id = data.sub;
    const user = await ctx.model.User.findById(id);
    if (user.role !== 2) {
      throw new HttpError({
        code: 403,
        msg: 'No Permission',
      });
    }
  }

  /**
   * @description 创建一个对象，调用此接口前，首先保证当前用户拥有 admin 权限
   * @param {User} params 用户信息，至少包含 name 和 password
   * @return {Promise<User>} 返回创建的用户实体
   */
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

  /**
   * @description 请注意此接口请求全表，请注意不要频繁调用，请让前端缓存数据
   * @return {Promise<User[]>} 用户列表
   */
  async list() {
    const ctx = this.ctx;
    return await ctx.model.User.find({}, commonFilter).limit(2000);
  }

  async update(params, id) {
    const ctx = this.ctx;
    return await ctx.model.User.findByIdAndUpdate(id, {
      ...params,
    }, {
      fields: commonFilter,
    });
  }

  async updateList(userList) {
    const ctx = this.ctx;
    const userModel = ctx.model.User;
    const list = userModel.insertMany(userList);
    return list;
  }
}

module.exports = UsersService;
