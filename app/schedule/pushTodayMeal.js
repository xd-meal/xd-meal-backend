const Subscription = require('egg').Subscription

class SlackPushTodayMeal extends Subscription {
  static get schedule () {
    return {
      cron: '0 0 10 * * *',
      type: 'worker',
      immediate: false
    }
  }

  async subscribe () {
    const nowDate = new Date()
    const dinings = await this.ctx.service.dining.getDiningsByDate(nowDate)
    const msgToPush = {
      text: '',
      blocks: []
    }
    msgToPush.text = nowDate.getMonth() + 1 + '月' + nowDate.getDate() + '日心动食堂菜单'
    dinings.sort((a, b) => {
      return a.pick_start - b.pick_start
    })
    for (let index = 0; index < dinings.length; index++) {
      const currentDining = dinings[index]
      if (currentDining.title.includes('加班')) {
        continue
      }
      msgToPush.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*' + currentDining.title + '*'
        }
      })
      for (let _index = 0; _index < currentDining.menu.length; _index++) {
        const currentDish = currentDining.menu[_index]
        const dishDesc = currentDish.desc.replace(/\n/g, '\n>')
        msgToPush.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '>*' + currentDish.title + '* - ' + currentDish.supplier + '\n>' + dishDesc
          }
        })
      }
    }
    if (msgToPush.blocks.length) {
      await this.ctx.service.slack.postMessage(msgToPush)
    }
  }
}

module.exports = SlackPushTodayMeal
