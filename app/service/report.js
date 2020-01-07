const Service = require('egg').Service
const ObjectId = require('mongoose').Types.ObjectId

class ReportService extends Service {
  async getOrderCount (dinings) {
    const ctx = this.ctx
    const OrderModel = ctx.model.Order
    return OrderModel.aggregate([
      {
        $match: {
          dining_id: {
            $in: dinings.map(el => ObjectId(el))
          }
        }
      },
      {
        $group:
          {
            _id: { dining_id: '$dining_id', menu_id: '$menu_id' },
            count: { $sum: 1 }
          }
      },
      {
        $group:
          {
            _id: '$_id.dining_id',
            menu: { $push: { menu_id: '$_id.menu_id', count: '$count' } }
          }
      }
    ])
  }
}
module.exports = ReportService
