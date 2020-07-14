class AppBootHook {
  constructor (app) {
    this.app = app
  }

  async willReady () {
    await this.app.redis.del('xdmeal_is_rolling')
    const redisRollRedundant = await this.app.redis.keys('dining_roll_*')
    for (let index = 0; index < redisRollRedundant.length; index++) {
      const el = redisRollRedundant[index]
      await this.app.redis.del(el)
    }
    const diningsToRoll = await this.app.mongoose.model('Dining').find({
      requireRoll: true
    })
    for (let index = 0; index < diningsToRoll.length; index++) {
      const el = diningsToRoll[index]
      await this.app.redis.set('dining_roll_' + el._id, el.order_end.getTime())
    }
  }
}
module.exports = AppBootHook
