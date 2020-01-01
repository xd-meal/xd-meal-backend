'use strict';

const Controller = require('egg').Controller;
const HttpError = require('../helper/error');

class DishController extends Controller {
  async pickingMyDish() {
    const ctx = this.ctx;
    const diningService = ctx.service.dining;
    const orderService = ctx.service.order;
    const tokenService = ctx.service.orderToken;
    const pickableDinings = await diningService.getAllPickableDinings();
    const nonOrders = [];
    const pickableIDs = pickableDinings.reduce((acc, cur) => {
      acc.push(cur._id);
      if (cur.stat_type === 0) {
        nonOrders.push(cur);
      }
      return acc;
    }, []);
    const myDish = await orderService.findPickableOrderByUserAndDiningIDs(ctx.session.user._id, pickableIDs);
    if (!myDish.length && !nonOrders.length) {
      throw new HttpError({
        code: 404,
        msg: '目前没有可取餐次',
      });
    } else if (myDish.length) {
      const currentOrder = myDish[0];
      const currentDining = pickableDinings.find(el => {
        return el._id.toString() === currentOrder.dining_id.toString();
      });
      const token = await tokenService.generate(ctx.session.user._id, currentDining._id, currentOrder._id);
      ctx.body = {
        token,
        dining: currentDining,
        order: currentOrder,
      };
    } else if (nonOrders.length) {
      const currentDining = nonOrders[0];
      const token = await tokenService.generate(ctx.session.user._id, currentDining._id);
      ctx.body = {
        token,
        dining: currentDining,
        order: {},
      };
    }
  }
}
module.exports = DishController;
