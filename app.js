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

  async didReady () {
    const config = this.app.config
    const ctx = this.app.createAnonymousContext()
    if (!config.wework || !config.wework.corpID) {
      return
    }
    const corps = Object.keys(config.wework.corpID || {})
    for (let index = 0; index < corps.length; index++) {
      try {
        const corp = corps[index]
        const accessToken = await ctx.service.wework.getAccessToken(corp)
        if (!config.wework.agentID[corp] || !config.wework.agentID[corp].length) {
          continue
        }
        await this.app.curl(
          'https://qyapi.weixin.qq.com/cgi-bin/menu/create?access_token=' +
        accessToken +
        '&agentid=' +
        config.wework.agentID[corp],
          {
            method: 'POST',
            contentType: 'json',
            data: {
              button: [
                {
                  type: 'view',
                  name: '吃啥',
                  key: 'https://order.xindong.com/?wework_source=' + corp,
                  sub_button: [],
                  url: 'https://order.xindong.com/?wework_source=' + corp
                }
              ]
            },
            dataType: 'json'
          }
        )
      } catch (error) {
        console.log(error)
      }
    }
  }
}
module.exports = AppBootHook
