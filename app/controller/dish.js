'use strict';

const Controller = require('egg').Controller;
const HttpError = require('../helper/error');

class DishController extends Controller {
  async pickingMyDish() {
    const ctx = this.ctx;
    const userService = ctx.service.users;
    const diningService = ctx.service.dining;
    const orderService = ctx.service.order;
    const tokenService = ctx.service.orderToken;
    if (!userService.isLoggedIn()) {
      throw new HttpError({
        code: 403,
        msg: '尚未登录',
      });
    }
    const pickableDinings = await diningService.getAllPickableDinings();
    const pickableIDs = [];
    pickableDinings.forEach(element => {
      pickableIDs.push(element._id);
    });
    const myDish = await orderService.findOrderByUserAndDiningIDs(ctx.session.user._id, pickableIDs);
    if (!myDish.length) {
      ctx.body = {
        code: 404,
        msg: '目前没有可取餐次',
      };
    } else {
      const currentOrder = myDish[0];
      const currentDining = pickableDinings.find(el => {
        return el._id === currentOrder.dining_id;
      });
      const token = tokenService.generate(currentOrder._id);
      ctx.body = {
        token,
        dining: currentDining,
        order: currentOrder,
      };
    }
  }
}
module.exports = DishController;
