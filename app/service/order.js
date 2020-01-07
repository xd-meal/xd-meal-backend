
const Service = require('egg').Service
// const HttpError = require('../helper/error');

class OrderService extends Service {
  async findOrderByUserAndDiningIDs (userID, diningIDs) {
    return this.ctx.model.Order.find({
      uid: userID,
      dining_id: { $in: diningIDs }
    })
  }

  async findPickableOrderByUserAndDiningIDs (userID, diningIDs) {
    return this.ctx.model.Order.find({
      uid: userID,
      dining_id: { $in: diningIDs },
      picked: false
    })
  }

  async findByID (orderID) {
    return this.ctx.model.Order.findById(orderID)
  }

  async deleteAllOrdersByDining (diningID) {
    return this.ctx.model.Order.deleteMany({
      dining_id: diningID
    })
  }

  async deleteOrdersByUserAndDinigns (userID, diningIDs) {
    return this.ctx.model.Order.deleteMany({
      uid: userID,
      dining_id: { $in: diningIDs }
    })
  }

  async getAllUnpickedOrdered (userID) {
    return this.ctx.model.Order.find({
      $and: [
        { uid: userID },
        { picked: false }
      ]
    })
  }

  async getAllByUserAndDiningIDs (userID, diningIDs) {
    return this.ctx.model.Order.find({
      uid: userID,
      dining_id: { $in: diningIDs }
    })
  }

  async batchOrder (userID, orders) {
    const ctx = this.ctx
    const orderModel = ctx.model.Order
    const session = await orderModel.startSession()
    const inserts = []
    session.startTransaction()
    this.logger.info('batchOrder: Starting order transaction, list length ' + orders.length)
    for (let index = 0; index < orders.length; index++) {
      const _order = orders[index]
      const _t = {
        uid: userID,
        dining_id: _order.diningId,
        menu_id: _order.menuId,
        picked: false
      }
      inserts.push(_t)
    }
    try {
      await orderModel.insertMany(inserts, { session })
      await session.commitTransaction()
      session.endSession()
      this.logger.info('batchOrder: Transaction finished successfully.')
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      throw error
    }
  }

  async addOrder (order) {
    const ctx = this.ctx
    const orderModel = ctx.model.Order
    return orderModel.create({
      uid: order.userId,
      dining_id: order.diningId,
      menu_id: order.menuId,
      picked: true
    })
  }

  async setPicked (orderId) {
    return this.ctx.model.Order.findOneAndUpdate({
      _id: orderId
    }, {
      picked: true
    })
  }
}

module.exports = OrderService
