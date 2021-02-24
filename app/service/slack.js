const Service = require('egg').Service
const HttpError = require('../helper/error')
const slackSDK = require('@slack/web-api')

class SlackService extends Service {
  async postMessage (message) {
    const slack = new slackSDK.WebClient(this.app.config.slack.token)
    try {
      const result = await slack.chat.postMessage({
        ...message,
        channel: this.app.config.slack.channel
      })
      if (!result.ok) {
        this.logger.info('Slack Push Faied')
        throw new HttpError({
          code: 403,
          msg: 'Slack 推送错误',
          data: result
        })
      }
      return result
    } catch (error) {
      this.logger.info('Slack Push Faied')
      throw new HttpError({
        code: 403,
        msg: 'Slack 推送错误',
        data: error
      })
    }
  }
}
module.exports = SlackService
