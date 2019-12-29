'use strict';
const Service = require('egg').Service;
// const HttpError = require('../helper/error');

class OrderService extends Service {
  async findOrderByUserAndDiningIDs(userID, diningIDs) {
    return await this.ctx.model.Order.find({
      uid: userID,
      dining_id: { $in: diningIDs },
    });
  }
  async findByID(orderID) {
    return await this.ctx.model.Order.findByID(orderID);
  }
  async deleteAllOrdersByDining(diningID) {
    return await this.ctx.model.Order.deleteMany({
      dining_id: diningID,
    });
  }
  async getAllUnpickedOrdered(userID) {
    return await this.ctx.model.Order.find({
      $and: [
        { uid: userID },
        { picked: false },
      ],
    });
  }
}

module.exports = OrderService;
