'use strict';

const Controller = require('egg').Controller;
const HttpError = require('../helper/error');

class PosController extends Controller {
  async performPick() {
    const ctx = this.ctx;
    const orderToken = await ctx.service.orderToken.get(ctx.params.token);
    if (!(orderToken && orderToken.userId && orderToken.diningId)) {
      throw new HttpError({
        code: 403,
        msg: 'Token 无效',
      });
    }
    const dining = await ctx.service.dining.getDiningByID(orderToken.diningId);
    if (dining.stat_type !== 0 && !orderToken.orderId) {
      throw new HttpError({
        code: 403,
        msg: 'Token 无效',
      });
    }
    if (dining.stat_type === 0) {
      ctx.service.order.addOrder({
        userId: orderToken.userId,
        diningId: orderToken.diningId,
        menuId: 0,
        picked: true,
      });
      const user = await ctx.service.users.getUserProfile(orderToken.userId);
      ctx.body = {
        code: 0,
        msg: '已取餐',
        data: {
          dining,
          user,
        },
      };
    } else {
      if (!orderToken.orderId) {
        throw new HttpError({
          code: 403,
          msg: 'Token 无效',
        });
      }
      const order = await ctx.service.order.findByID(orderToken.orderId);
      if (!order) {
        throw new HttpError({
          code: 403,
          msg: 'Token 无效',
        });
      }
      const user = await ctx.service.users.getUserProfile(orderToken.userId);
      const dish = dining.menu.find(el => {
        return el._id === order.menu_id;
      });
      await ctx.service.order.setPicked(orderToken.orderId);
      ctx.body = {
        code: 0,
        msg: '已取餐',
        data: {
          dining,
          order,
          dish,
          user,
        },
      };
    }
  }
}
module.exports = PosController;
