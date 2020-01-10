const Service = require('egg').Service
const ObjectId = require('mongoose').Types.ObjectId

class ReportService extends Service {
  async getOrderCountByDinings (dinings) {
    const ctx = this.ctx
    const OrderModel = ctx.model.Order
    return OrderModel.aggregate([
      {
        $match: {
          dining_id: {
            $in: dinings.map(el => ObjectId(el))
          }
        }
      }, {
        $lookup: {
          from: 'user',
          localField: 'uid',
          foreignField: '_id',
          as: 'userInfo'
        }
      }, {
        $unwind: {
          path: '$userInfo'
        }
      }, {
        $lookup: {
          from: 'dining',
          localField: 'dining_id',
          foreignField: '_id',
          as: 'diningInfo'
        }
      }, {
        $unwind: {
          path: '$diningInfo'
        }
      }, {
        $group: {
          _id: {
            dining: '$diningInfo',
            menu_id: '$menu_id',
            corp: '$userInfo.wechat_corpid'
          },
          count: {
            $sum: 1
          }
        }
      }, {
        $group: {
          _id: '$_id.dining',
          stat: {
            $push: {
              menu_id: '$_id.menu_id',
              corp: '$_id.corp',
              count: '$count'
            }
          }
        }
      }
    ])
  }

  async getUserCountByDinings (dinings) {
    const ctx = this.ctx
    const OrderModel = ctx.model.Order
    return OrderModel.aggregate([
      {
        $match: {
          dining_id: {
            $in: dinings
          }
        }
      }, {
        $lookup: {
          from: 'user',
          localField: 'uid',
          foreignField: '_id',
          as: 'userInfo'
        }
      }, {
        $unwind: {
          path: '$userInfo'
        }
      }, {
        $group: {
          _id: {
            corp: '$userInfo.wechat_corpid'
          },
          count: {
            $sum: 1
          }
        }
      }, {
        $project: {
          _id: 0,
          corp: '$_id.corp',
          count: '$count'
        }
      }
    ])
  }

  async getPersonalReport (dinings, corp) {
    const ctx = this.ctx
    const OrderModel = ctx.model.Order
    return OrderModel.aggregate([
      {
        $match: {
          dining_id: {
            $in: dinings.map(el => ObjectId(el))
          }
        }
      }, {
        $lookup: {
          from: 'user',
          localField: 'uid',
          foreignField: '_id',
          as: 'userInfo'
        }
      }, {
        $unwind: {
          path: '$userInfo'
        }
      }, {
        $addFields: {
          corp: '$userInfo.wechat_corpid'
        }
      }, {
        $match: {
          corp
        }
      }, {
        $lookup: {
          from: 'dish',
          localField: 'menu_id',
          foreignField: '_id',
          as: 'dishInfo'
        }
      }, {
        $unwind: {
          path: '$dishInfo'
        }
      }, {
        $lookup: {
          from: 'dining',
          localField: 'dining_id',
          foreignField: '_id',
          as: 'diningInfo'
        }
      }, {
        $unwind: {
          path: '$diningInfo'
        }
      }
    ])
  }
}
module.exports = ReportService
