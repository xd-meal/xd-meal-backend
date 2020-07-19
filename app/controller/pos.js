
const Controller = require('egg').Controller
const HttpError = require('../helper/error')

class PosController extends Controller {
  async performPick () {
    const ctx = this.ctx
    const orderToken = await ctx.service.orderToken.get(ctx.params.token)
    if (!(orderToken && orderToken.userId && orderToken.diningId)) {
      throw new HttpError({
        code: 403,
        msg: 'Token 无效'
      })
    }
    const dining = await ctx.service.dining.getDiningByID(orderToken.diningId)
    if (dining.stat_type !== 0 && !orderToken.orderId) {
      throw new HttpError({
        code: 403,
        msg: 'Token 无效'
      })
    }
    if (dining.stat_type === 0) {
      await ctx.service.order.addOrder({
        userId: orderToken.userId,
        diningId: orderToken.diningId,
        menuId: dining.menu[0]._id,
        picked: true
      })
      const user = await ctx.service.users.getUserProfile(orderToken.userId)
      await ctx.service.orderToken.delete(ctx.params.token)
      ctx.body = {
        code: 0,
        msg: '已取餐',
        data: {
          dining,
          user
        }
      }
    } else {
      if (!orderToken.orderId) {
        throw new HttpError({
          code: 403,
          msg: 'Token 无效'
        })
      }
      const order = await ctx.service.order.findByID(orderToken.orderId)
      if (!order) {
        throw new HttpError({
          code: 403,
          msg: 'Token 无效'
        })
      }
      const user = await ctx.service.users.getUserProfile(orderToken.userId)
      const dishIndex = dining.menu.findIndex(el => {
        return el._id.toString() === order.menu_id.toString()
      })
      await ctx.service.order.setPicked(orderToken.orderId)
      await ctx.service.orderToken.delete(ctx.params.token)
      ctx.body = {
        code: 0,
        msg: '已取餐',
        data: {
          dining,
          order,
          dishIndex,
          dish: dining.menu[dishIndex],
          user
        }
      }
    }
  }

  async pickByNfcUid () {
    const ctx = this.ctx
    const diningService = ctx.service.dining
    const orderService = ctx.service.order
    const userService = ctx.service.users
    const user = await userService.getUserByNfcUid(ctx.params.nfcuid)
    if (!user) {
      throw new HttpError({
        code: 403,
        msg: '无效的 NFC 标签'
      })
    }
    delete user.password
    delete user.psw_salt
    const pickableDinings = await diningService.getAllPickableDinings()
    const nonOrders = []
    const pickableIDs = pickableDinings.reduce((acc, cur) => {
      acc.push(cur._id)
      if (cur.stat_type === 0) {
        nonOrders.push(cur)
      }
      return acc
    }, [])
    const myDish = await orderService.findPickableOrderByUserAndDiningIDs(ctx.session.user._id, pickableIDs)
    if (!myDish.length && !nonOrders.length) {
      throw new HttpError({
        code: 403,
        msg: '目前没有可取餐次'
      })
    } else if (myDish.length) {
      const currentOrder = myDish[0]
      const currentDining = pickableDinings.find(el => {
        return el._id.toString() === currentOrder.dining_id.toString()
      })
      const user = await ctx.service.users.getUserProfile(currentOrder.uid)
      const dishIndex = currentDining.menu.findIndex(el => {
        return el._id.toString() === currentOrder.menu_id.toString()
      })
      await ctx.service.order.setPicked(currentOrder._id)
      ctx.body = {
        code: 0,
        msg: '已取餐',
        data: {
          currentDining,
          currentOrder,
          dishIndex,
          dish: dining.menu[dishIndex],
          user
        }
      }
    } else if (nonOrders.length) {
      const currentDining = nonOrders[0]
      const order = await orderService.getByUserAndDiningID(user._id, currentDining._id)
      if (order) {
        throw new HttpError({
          code: 404,
          msg: '目前没有可取餐次'
        })
      }
      await ctx.service.order.setPicked(currentOrder._id)
      ctx.body = {
        code: 0,
        msg: '已取餐',
        data: {
          currentDining,
          user
        }
      }
    }
  }
}
module.exports = PosController
