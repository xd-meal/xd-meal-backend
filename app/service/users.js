'use strict';
const Service = require('egg').Service;
const HttpError = require('../helper/error');
const crypto = require('crypto');
const commonFilter = {
  __v: 0,
};

class UsersService extends Service {
  async passwordLogin(params) {
    const ctx = this.ctx;
    let user = null;
    try {
      user = await ctx.model.User.findOne({
        email: params.email,
      });
    } catch (error) {
      console.log(error);
    }
    const hash = crypto.createHash('md5');
    hash.update(params.password + user.psw_salt);
    if (user.password !== hash.digest('hex')) {
      throw new HttpError({
        code: 403,
        msg: '邮箱或密码错误',
      });
    }
    return user;
  }

  async weworkLogin(userid, corp) {
    const ctx = this.ctx;
    let user = null;
    try {
      user = await ctx.model.User.findOne({
        wework_userid: userid,
        wechat_corpid: corp,
      });
    } catch (error) {
      console.log(error);
    }
    return user;
  }

  async weworkCreate(userInfo, corp) {
    const ctx = this.ctx;
    return await ctx.model.User.create({
      username: userInfo.name,
      wework_userid: userInfo.userid,
      wechat_corpid: corp,
      email: userInfo.email || null,
      role: 0,
      department: userInfo.department[0] || null,
    });
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
   * @description 判断用户是否已登录
   * @return {Boolean} 是否已登录
   */
  isLoggedIn() {
    if (this.ctx.session.user) {
      return true;
    }
    return false;
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
    if (!(params.email && params.password) && !params.wework_userid) {
      throw new HttpError({
        code: 403,
        msg: '用户必须拥有一项登陆方式',
      });
    }
    if (params.password) {
      if (params.password.length < 8 || params.password.length >= 22) {
        throw new HttpError({
          code: 403,
          msg: '密码长度必须为8-21字符',
        });
      }
      const hash = crypto.createHash('md5');
      hash.update(Date.now().toString() + parseInt(Math.random() * 100000).toString());
      params.psw_salt = hash.digest('hex');
      hash.update(params.password + params.psw_salt);
      params.password = hash.digest('hex');
    }
    if (params.email) {
      const _emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      if (!_emailRegex.test(params.email)) {
        throw new HttpError({
          code: 403,
          msg: '邮箱不符合规范',
        });
      }
    }
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
}

module.exports = UsersService;
