const Subscription = require('egg').Subscription

class RollDining extends Subscription {
  static get schedule () {
    return {
      cron: '0 * * * * *',
      type: 'worker',
      immediate: true
    }
  }

  async subscribe () {
    this.ctx.service.roll.doRoll()
  }
}

module.exports = RollDining
