
const Controller = require('egg').Controller
const HttpError = require('../helper/error')

class DiningController extends Controller {
  async getAllOrderable () {
    const orderable = await this.ctx.service.dining.getAllOrderable()
    const orderableIds = orderable.reduce((acc, cur) => {
      acc.push(cur._id)
      return acc
    }, [])
    const ordered = await this.ctx.service.order.findOrderByUserAndDiningIDs(this.ctx.session.user._id, orderableIds)
    this.ctx.body = {
      dinings: orderable,
      orders: ordered
    }
  }

  async getAllUnpickedOrdered () {
    const dinings = await this.ctx.service.dining.getFuturePickable()
    const diningIDs = dinings.reduce((acc, cur) => {
      acc.push(cur._id)
      return acc
    }, [])
    const ordered = await this.ctx.service.order.getAllByUserAndDiningIDs(this.ctx.session.user._id, diningIDs)
    // const ordered = await this.ctx.service.order.getAllUnpickedOrdered(this.ctx.session.user._id);
    // const dinings = await this.ctx.service.dining.getDinings(ordered.reduce((acc, cur) => {
    //   acc.push(cur.dining_id);
    //   return acc;
    // }, []));
    this.ctx.body = {
      ordered,
      dinings
    }
  }

  async toggleVoteDown () {
    const ctx = this.ctx
    const orderId = ctx.params.id
    if (!orderId) {
      throw new HttpError({
        code: 402,
        msg: '必须指定订单id'
      })
    }
    const isVoteDown = Boolean(ctx.request.body.isVoteDown)
    const order = await ctx.service.order.updateOrderVoteDown(isVoteDown, orderId, ctx.session.user._id)
    console.log(order)
    if (!order) {
      throw new HttpError({
        code: 402,
        msg: `不存在指定订单号：${orderId}`
      })
    }
    ctx.body = {}
  }

  async performOrder () {
    const ctx = this.ctx
    const orders = ctx.request.body
    const dinings = await ctx.service.dining.getOrderableDinings(orders.reduce((acc, cur) => {
      acc.push(cur.diningId)
      return acc
    }, []))
    orders.forEach(order => {
      const _index = dinings.findIndex(dining => {
        return (dining._id).toString() === (order.diningId).toString()
      })
      if (_index < 0) {
        this.logger.info('performOrder: request includes invalid dinings.' +
        ' Orders: ' + JSON.stringify(orders) + '\nDinings: ' + JSON.stringify(dinings) + '\nCurrent' +
        ' items: ' + JSON.stringify(order))
        throw new HttpError({
          code: 403,
          msg: '点餐内容包含无效餐次'
        })
      }
    })
    await ctx.service.order.deleteOrdersByUserAndDinigns(ctx.session.user._id, dinings.reduce((acc, cur) => {
      acc.push(cur._id)
      return acc
    }, []))
    await ctx.service.order.batchOrder(ctx.session.user._id, orders)
    ctx.body = {
      code: 0
    }
  }
}
module.exports = DiningController
