'use strict';
const HttpError = require('../helper/error');

module.exports = async (ctx, next) => {
  if (!ctx.session.user || ctx.session.user.role !== 2) {
    throw new HttpError({
      code: 403,
      msg: '无权访问指定内容',
    });
  } else {
    await next();
  }
};
