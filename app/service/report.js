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
            channel: { $arrayElemAt: ['$userInfo.channel', 0] }
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
              channel: '$_id.channel',
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
        $group: {
          _id: {
            channel: { $arrayElemAt: ['$userInfo.channel', 0] }
          },
          count: {
            $sum: 1
          }
        }
      }, {
        $project: {
          _id: 0,
          channel: '$_id.channel',
          count: '$count'
        }
      }
    ])
  }

  async getPersonalReport (dinings, channel) {
    const ctx = this.ctx
    const OrderModel = ctx.model.Order
    const _aggregation = [
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
        $project: {
          'userInfo.password': 0,
          'userInfo.psw_salt': 0
        }
      }, {
        $group: {
          _id: {
            dining_id: '$dining_id',
            menu_id: '$menu_id'
          },
          orders: {
            $push: {
              userInfo: { $arrayElemAt: ['$userInfo', 0] },
              picked: '$picked',
              createTime: '$createTime',
              updateTime: '$updateTime'
            }
          }
        }
      }, {
        $group: {
          _id: '$_id.dining_id',
          orderList: {
            $push: {
              menu_id: '$_id.menu_id',
              orders: '$orders'
            }
          }
        }
      }, {
        $lookup: {
          from: 'dining',
          localField: '_id',
          foreignField: '_id',
          as: 'dining'
        }
      }
    ]
    if (channel !== 'all') {
      _aggregation.splice(2, 0, {
        $match: {
          'userInfo.channel': channel
        }
      })
    }
    return OrderModel.aggregate(_aggregation)
  }
}
module.exports = ReportService
