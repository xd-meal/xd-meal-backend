'use strict';

const Controller = require('egg').Controller;
const HttpError = require('../helper/error');

class PosController extends Controller {
  async performPick() {
    const ctx = this.ctx;
    const order = await ctx.service.orderToken.get(ctx.params.token);
    if (!(order && order.userId && order.diningId)) {
      throw new HttpError({
        code: 403,
        msg: 'Token 无效',
      });
    }
    const dining = await ctx.service.dining.getDiningByID(order.diningId);
    if (dining.stat_type !== 0 && !order.orderId) {
      throw new HttpError({
        code: 403,
        msg: 'Token 无效',
      });
    }
    if (dining.stat_type === 0) {
      ctx.service.order.addOrder({
        userId: order.userId,
        diningId: order.diningId,
        menuId: 0,
        picked: true,
      });
    } else {
      if (!order.orderId) {
        throw new HttpError({
          code: 403,
          msg: 'Token 无效',
        });
      }
      if (!await ctx.service.order.findByID(order.orderId)) {
        throw new HttpError({
          code: 403,
          msg: 'Token 无效',
        });
      }
      const user = ctx.service.users.getUserProfile(order.userId);
      await ctx.service.order.setPicked(order.orderId);
      ctx.body = {
        code: 0,
        msg: '已取餐',
        data: {
          dining,
          order,
          user,
        },
      };
    }
  }
}
module.exports = PosController;
