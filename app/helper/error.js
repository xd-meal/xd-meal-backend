'use strict';

class HttpError extends Error {
  constructor(setting) {
    const { code, msg, data } = setting;
    // 强制重置为空，这样防止在 middleware 阶段被阻止
    super('');
    this.status = code;
    this.data = data;
    this.msg = msg;
  }
}

module.exports = HttpError;
