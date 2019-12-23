'use strict';

const Controller = require('egg').Controller;

class WeWorkController extends Controller {
  async login() {
    const { ctx } = this;
    if (ctx.request.body.hasOwnProperty('corp') && ctx.request.body.hasOwnProperty('code')) {
      if (Object.keys(this.config.wework.accessToken).includes(ctx.request.body.corp)) {
        const result = await ctx.curl('https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=' + this.config.wework.accessToken[ctx.request.body.corp] + '&code=' + ctx.request.body.code);
        console.log(result.data.toString());
        if (!result.data.errcode && result.data.UserId) {
          // const userid = result.data.UserId;
          ctx.body = JSON.parse(result.data);
        } else if (!result.data.errcode && result.data.OpenId) {
          ctx.body = { code: -1, msg: 'user not corp member' };
        } else {
          ctx.body = JSON.parse(result.data);
        }
      }
    } else {
      ctx.body = { code: -1, msg: 'invalid request' };
    }
  }
}

module.exports = WeWorkController;
