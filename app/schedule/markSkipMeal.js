const Subscription = require('egg').Subscription

class MarkSkipMeal extends Subscription {
  static get schedule () {
    return {
      cron: '0 0 3 * * *',
      type: 'worker'
    }
  }

  async subscribe () {
    this.ctx.service.order.setSkipMealPicked()
  }
}

module.exports = MarkSkipMeal
