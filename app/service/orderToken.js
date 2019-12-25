'use strict';
const crypto = require('crypto');
const Service = require('egg').Service;
const hash = crypto.createHash('md5');
class OrderTokenService extends Service {
  async set(orderid, seconds) {
    if (this.app.redis) {
      hash.update(orderid + Date.now().toString());
      await this.app.redis.set('ORDER_' + hash.digest('hex'), orderid, 'EX', seconds);
      return hash.digest('hex');
    }
  }

  async get(key) {
    if (this.app.redis) {
      const data = await this.app.redis.get('ORDER_' + key);
      return data;
    }
  }
}

module.exports = OrderTokenService;
