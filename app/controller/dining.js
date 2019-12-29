'use strict';

const Controller = require('egg').Controller;

class DiningController extends Controller {
  async getAllOrderable() {
    const orderable = await this.ctx.service.dining.getAllOrderable();
    const orderableIds = orderable.reduce((acc, cur) => {
      acc.push(cur._id);
      return acc;
    }, []);
    const ordered = await this.ctx.service.order.findOrderByUserAndDiningIDs(this.ctx.session.user._id, orderableIds);
    return {
      dinings: orderable,
      orders: ordered,
    };
  }
  async getAllUnpickedOrdered() {
    const ordered = await this.ctx.service.order.getAllUnpickedOrdered(this.ctx.session.user._id);
    const dinings = await this.ctx.service.dining.getDinings(ordered.reduce((acc, cur) => {
      acc.push(cur.dining_id);
      return acc;
    }, []));
    return {
      ordered,
      dinings,
    };
  }
}
module.exports = DiningController;
