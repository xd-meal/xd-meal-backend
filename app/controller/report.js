
const Controller = require('egg').Controller
const HttpError = require('../helper/error')

class ReportController extends Controller {
  async orderCount () {
    const ctx = this.ctx
    const startTime = ctx.params.startTime
    const endTime = ctx.params.endTime
    const dinings = await ctx.service.dining.findDiningByTime({
      startTime,
      endTime
    })
    ctx.body = await ctx.service.report.getOrderCountByDinings(dinings.reduce((acc, cur) => {
      acc.push(cur._id)
      return acc
    }, []))
  }

  async userCount () {
    const ctx = this.ctx
    const startTime = ctx.params.startTime
    const endTime = ctx.params.endTime
    const dinings = await ctx.service.dining.findDiningByTime({
      startTime,
      endTime,
      stat_type: 0
    })
    ctx.body = await ctx.service.report.getUserCountByDinings(dinings.reduce((acc, cur) => {
      acc.push(cur._id)
      return acc
    }, []))
  }

  async userDetail () {
    const ctx = this.ctx
    const corp = ctx.params.corp
    const startTime = ctx.params.startTime
    const endTime = ctx.params.endTime
    if (ctx.session.user.role < 2) {
      if (corp !== ctx.session.user.channel) {
        throw new HttpError({
          code: 403,
          msg: '分管只能查询同企业下的点餐记录'
        })
      }
    }
    const dinings = await ctx.service.dining.findDiningByTime({
      startTime,
      endTime
    })
    ctx.body = await ctx.service.report.getPersonalReport(dinings.reduce((acc, cur) => {
      acc.push(cur._id)
      return acc
    }, []), corp)
  }
}
module.exports = ReportController
