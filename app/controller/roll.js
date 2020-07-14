const Controller = require('egg').Controller
// const HttpError = require('../helper/error')

class RollController extends Controller {
  async getRollList () {
    const orderable = await this.ctx.service.dining.getAllOrderable()
    const orderableIds = orderable.reduce((acc, cur) => {
      acc.push(cur._id)
      return acc
    }, [])
    const rollTickets = await this.ctx.service.roll.findRollTicketByUserAndDiningIDs(this.ctx.session.user._id, orderableIds)
    const _ret = {}
    rollTickets.forEach(_ => {
      _ret[_.dining_id] = _.menu_id
    })
    this.ctx.body = _ret
  }

  async updateRollList () {
    const ctx = this.ctx
    const orderables = await this.ctx.service.dining.getAllOrderable()
    const orderablesObj = orderables.reduce((acc, cur) => {
      acc[cur._id.toString()] = cur
      return acc
    }, {})
    const req = ctx.request.body
    ctx.body = await ctx.service.roll.performBatchRoll(req, orderablesObj)
  }
}
module.exports = RollController
