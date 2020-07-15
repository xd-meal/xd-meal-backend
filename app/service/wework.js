
const Service = require('egg').Service
const HttpError = require('../helper/error')

class WeWorkService extends Service {
  async getAccessToken (corp) {
    const redis = this.ctx.app.redis
    let token = await redis.get('wework_access_token_' + corp)
    if (!token) {
      this.logger.info('getAccessToken: Redis get failed, performing fetch from WeWork.')
      token = await this.fetchToken(corp)
    }
    return token
  }

  async fetchToken (corp) {
    const config = this.ctx.app.config
    if (!config.wework || !config.wework.secret || !config.wework.secret[corp]) {
      this.logger.error('fetchToken: Invalid wework settings or param.\nIncoming corp: ' + corp + '\nCheck WeWork settings.')
      throw new HttpError({
        code: 403,
        msg: '未配置企业微信或请求无效'
      })
    }
    const redis = this.ctx.app.redis
    const wework = config.wework
    const result = await this.ctx.curl('https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=' + wework.corpID[corp] + '&corpsecret=' + wework.secret[corp], {
      dataType: 'json'
    })
    if (result.data.errcode) {
      this.logger.error('fetchToken: Failed to get from WeWork remote, corp: ' + corp)
      throw new HttpError({
        code: 403,
        msg: '获取企业微信 Token 失败',
        data: result.data
      })
    }
    redis.set('wework_access_token_' + corp, result.data.access_token, 'EX', parseInt(result.data.expires_in / 1.2))
    return result.data.access_token
  }

  async getUserID (code, corp) {
    const accessToken = await this.getAccessToken(corp)
    const result = await this.ctx.curl('https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=' + accessToken + '&code=' + code, {
      dataType: 'json'
    })
    if (result.data.errcode) {
      this.logger.error('getUserID: Failed to get UserId, code: ' + code + ' corp: ' + corp + ' with response:\n', result)
      throw new HttpError({
        code: 403,
        msg: '获取企业微信 UserID 失败',
        data: result.data
      })
    }
    return result.data.UserId
  }

  async getUserInfo (userid, corp) {
    const accessToken = await this.getAccessToken(corp)
    const result = await this.ctx.curl('https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token=' + accessToken + '&userid=' + userid, {
      dataType: 'json'
    })
    if (result.data.errcode) {
      this.logger.error('getUserInfo: Failed to get user info, userid: ' + userid + ' corp: ' + corp)
      throw new HttpError({
        code: 403,
        msg: '获取企业微信用户信息失败',
        data: result.data
      })
    }
    return result.data
  }

  async sendRollWinnerMsg (userListByCorp) {
    const queue = []
    const config = this.ctx.app.config
    for (const corp in userListByCorp) {
      if (Object.prototype.hasOwnProperty.call(userListByCorp, corp)) {
        const users = Array.from(userListByCorp[corp])
        while (users.length) {
          const _d = {
            touser: '',
            msgtype: 'text',
            agentid: 0,
            text: {
              content: '恭喜你成功获取了限量菜品\n\n请前往点餐页面确认下周菜单~'
            }
          }
          _d.touser = users.splice(0, 1000).join('|')
          _d.agentid = config.wework.agentID[corp]
          queue.push({
            data: _d,
            token: await this.ctx.service.wework.getAccessToken(corp)
          })
        }
      }
    }
    for (let index = 0; index < queue.length; index++) {
      const job = queue[index]
      await this.ctx.curl('https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=' + job.token, {
        method: 'POST',
        contentType: 'json',
        data: job.data,
        dataType: 'json'
      })
    }
  }
}

module.exports = WeWorkService
