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
        $group: {
          _id: {
            dining: '$dining_id',
            menu_id: '$menu_id',
            corp: { $arrayElemAt: ['$userInfo.wechat_corpid', 0] }
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
      }, {
        $lookup: {
          from: 'dining',
          localField: '_id',
          foreignField: '_id',
          as: '_id'
        }
      }, {
        $unwind: {
          path: '$_id'
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
      },
      {
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
        $match: {
          'userInfo.wechat_corpid': corp
        }
      }, {
        $group: {
          _id: {
            dining_id: '$dining_id',
            dish_id: '$menu_id'
          },
          orders: {
            $push: {
              userInfo: '$userInfo',
              picked: '$picked',
              createTime: '$createTime'
            }
          }
        }
      }, {
        $lookup: {
          from: 'dining',
          localField: '_id.dining_id',
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
