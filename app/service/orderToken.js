
const Service = require('egg').Service
const md5 = require('crypto-js/md5')
class OrderTokenService extends Service {
  async generate (userId, diningId, orderId = null) {
    if (this.app.redis) {
      const token = md5(userId + diningId + Date.now()).toString()
      await this.app.redis.set('ORDER_' + token, JSON.stringify({
        userId,
        diningId,
        orderId
      }), 'EX', 90)
      return token
    }
  }

  async get (key) {
    if (this.app.redis) {
      const data = await this.app.redis.get('ORDER_' + key)
      return JSON.parse(data)
    }
  }
}

module.exports = OrderTokenService
