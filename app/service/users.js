'use strict';
const Service = require('egg').Service;
const HttpError = require('../helper/error');
const sha256 = require('crypto-js/sha256');
const commonFilter = {
  __v: 0,
};
const chrList = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const _emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

function randomString(length, chars) {
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
function pswEncode(str, pswSalt, confSalt = '') {
  return sha256(str + pswSalt + confSalt);
}
class UsersService extends Service {
  async passwordLogin(setting) {
    const { password, email } = setting;
    const ctx = this.ctx;
    const userModel = ctx.model.User;
    // 先查 email
    const user = await userModel.findOne({
      email,
    }, commonFilter);
    if (!user) {
      throw new HttpError({
        code: 403,
        msg: '用户名或密码错误',
      });
    }
    const pswSalt = user.psw_salt;
    const psw = user.password;
    const encodePsw = pswEncode(password, pswSalt).toString();
    if (psw === encodePsw) {
      ctx.session.userId = user._id;
      return user;
    }
    throw new HttpError({
      code: 403,
      msg: '用户名或密码错误',
    });
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
   * @param {User} user 用户信息，至少包含 name 和 password
   * @return {Promise<User>} 返回创建的用户实体
   */
  async create(user) {
    const ctx = this.ctx;
    // 用户名约束
    if (user.username.length >= 22) {
      throw new HttpError({
        code: 403,
        msg: '用户名长度必须为22字符以内',
      });
    }
    // 密码约束
    if (!(user.email && user.password) && !user.wework_userid) {
      throw new HttpError({
        code: 403,
        msg: '用户必须拥有一项登陆方式',
      });
    }
    if (user.password) {
      if (user.password.length < 8 || user.password.length >= 22) {
        throw new HttpError({
          code: 403,
          msg: '密码长度必须为8-21字符',
        });
      }
      const psw = user.password;
      const pswHash = randomString(32, chrList);
      user.password = pswEncode(psw, pswHash);
      user.psw_salt = pswHash;
    }
    if (user.email) {
      if (!_emailRegex.test(user.email)) {
        throw new HttpError({
          code: 403,
          msg: '邮箱不符合规范',
        });
      }
    }
    return await ctx.model.User.create({
      ...user,
    });
  }

  /**
   * @description 请注意此接口请求全表，请注意不要频繁调用，请让前端缓存数据
   * @return {Promise<User[]>} 用户列表
   */
  async findAllUsers() {
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

  async importList(users) {
    const ctx = this.ctx;
    const userModel = ctx.model.User;
    const inserts = [];
    const backRes = [];
    const session = await userModel.startSession();
    session.startTransaction();
    try {
      for (const user of users) {
        if (user.password.length <= 6) {
          user.password = '';
        }
        const psw = user.password ? user.password : randomString(16, chrList);
        const pswHash = randomString(32, chrList);
        const queryExecution = {
          username: user.username,
          department: user.department,
          email: user.email,
          password: pswEncode(psw, pswHash),
          psw_salt: pswHash,
        };

        backRes.push({
          email: user.email,
          password: psw,
        });

        inserts.push(queryExecution);
      }
      await userModel.insertMany(inserts, { session });
      await session.commitTransaction();
      session.endSession();
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      switch (e.code) {
        case 11000:
          throw new HttpError({
            code: 403,
            msg: '存在重复email',
          });
        default:
          throw e;
      }
    }
    return backRes;
  }
}

module.exports = UsersService;
