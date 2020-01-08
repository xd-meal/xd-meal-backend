
const Controller = require('egg').Controller

class ReportController extends Controller {
  async orderCount () {
    const ctx = this.ctx
    const startTime = ctx.params.startTime
    const endTime = ctx.params.endTime
    const dinings = await ctx.service.dining.findDiningByTime({
      startTime,
      endTime,
      stat_type: 1
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
}
module.exports = ReportController
