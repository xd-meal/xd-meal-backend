'use strict';
const HttpError = require('../helper/error');

module.exports = async (ctx, next) => {
  if (!ctx.app.config.pos.keys.includes(ctx.get('xd-meal-pos-auth'))) {
    throw new HttpError({
      code: 403,
      msg: '机端密钥与服务器不符',
    });
  } else {
    await next();
  }
};
