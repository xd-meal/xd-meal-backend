
const Controller = require('egg').Controller

const diningsArrayFilter = ['string']

class ReportController extends Controller {
  async orderCount () {
    const ctx = this.ctx
    ctx.validate(diningsArrayFilter, ctx.request.body)
    ctx.body = await ctx.service.report.getOrderCount(ctx.request.body)
  }
}
module.exports = ReportController
