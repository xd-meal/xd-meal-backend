'use strict';
const Service = require('egg').Service;
const HttpError = require('../helper/error');

class OrderService extends Service {
  async findOrderByUserAndDiningID(userID, diningID) {
    return await this.ctx.model.order.findOne({
      uid: userID,
      dining_id: diningID,
    });
  }
}

module.exports = OrderService;
