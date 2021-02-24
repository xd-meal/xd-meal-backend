
const Service = require('egg').Service
const HttpError = require('../helper/error')
const ObjectId = require('mongoose').Types.ObjectId

const commonFilter = {
  __v: 0
}

class DiningService extends Service {
  async findDiningByTime (setting) {
    const ctx = this.ctx
    const {
      startTime,
      endTime
    } = setting
    const DiningModel = ctx.model.Dining
    const pickStartTimeAfterStartTime = {
      pick_start: {
        $gt: startTime
      }
    }
    const pickEndTimeBeforeEndTime = {
      pick_end: {
        $lt: endTime
      }
    }
    const params = [
      pickStartTimeAfterStartTime,
      pickEndTimeBeforeEndTime
    ]
    if (Object.prototype.hasOwnProperty.call(setting, 'stat_type')) {
      params.push({
        stat_type: setting.stat_type
      })
    }
    // 选取取餐时间开始大于选定时间头，而终止时间小于选定时间末尾
    return DiningModel.find({
      $and: params
    })
  }

  async addNewDining (dining) {
    const ctx = this.ctx
    const DiningModel = ctx.model.Dining
    const DishModel = ctx.model.Dish
    const findList = dining.menu.map(item => (ObjectId(item)))
    const res = await DishModel.aggregate([
      { $match: { _id: { $in: findList } } },
      { $addFields: { __order: { $indexOfArray: [findList, '$_id'] } } },
      { $sort: { __order: 1 } }
    ])
    if (res.length !== findList.length) {
      this.logger.info('error menu id, findList:', dining.menu, 'resultList:', res.map(_ => _._id))
      throw new HttpError({
        code: 403,
        msg: '存在错误的 menu id',
        data: { findList: dining.menu, result: res.map(_ => _._id) }
      })
    }
    if (Object.values(dining.limits).findIndex(el => el < 0) > -1) {
      throw new HttpError({
        code: 403,
        msg: '存在错误的数量限制',
        data: { findList: dining.menu, limits: dining.limits }
      })
    }
    return DiningModel.create({
      title: dining.title,
      order_start: dining.order_start,
      order_end: dining.order_end,
      pick_start: dining.pick_start,
      pick_end: dining.pick_end,
      stat_type: dining.stat_type,
      requireRoll: Object.values(dining.limits).findIndex(el => el > 0) > -1,
      menu: res.map(_ => ({
        _id: _._id,
        title: _.title,
        desc: _.desc,
        supplier: _.supplier,
        limit: dining.limits[_._id]
      }))
    })
  }

  async updateDining (dining, id) {
    const ctx = this.ctx
    const DiningModel = ctx.model.Dining
    const DishModel = ctx.model.Dish
    // TODO: 重复操作合并
    const findList = dining.menu.map(item => ({
      _id: item
    }))
    const res = await DishModel.find({
      $or: findList
    }, commonFilter)
    if (res.length !== findList.length) {
      throw new HttpError({
        code: 403,
        msg: '存在错误的 menu id',
        data: { findList: dining.menu, result: res.map(_ => _._id) }
      })
    }
    return DiningModel.findByIdAndUpdate(id, {
      order_start: dining.order_start,
      order_end: dining.order_end,
      pick_start: dining.pick_start,
      pick_end: dining.pick_end,
      stat_type: dining.stat_type,
      menu: res.map(_ => ({
        _id: _._id,
        title: _.title,
        desc: _.desc,
        suppier: _.suppier
      }))
    }, { new: true })
  }

  async deleteDiningById (id) {
    const ctx = this.ctx
    const DiningModel = ctx.model.Dining
    return DiningModel.findByIdAndDelete(id)
  }

  async getAllOrderable () {
    const ctx = this.ctx
    const DiningModel = ctx.model.Dining
    return DiningModel.find({
      $and: [
        {
          order_start: { $lt: Date.now() },
          order_end: { $gt: Date.now() }
        },
        { stat_type: 1 }
      ]
    })
  }

  async getAllPickableDinings () {
    const ctx = this.ctx
    const DiningModel = ctx.model.Dining
    return DiningModel.find({
      pick_start: { $lt: Date.now() },
      pick_end: { $gt: Date.now() }
    })
  }

  async getOrderableDinings (diningIDs) {
    return this.ctx.model.Dining.find({
      $and: [
        {
          order_start: { $lt: Date.now() },
          order_end: { $gt: Date.now() }
        },
        { _id: { $in: diningIDs } }
      ]
    })
  }

  async getDiningsByDate (date) {
    if (!(date instanceof Date)) {
      this.logger.info('argument is not an instance of Date')
      throw new HttpError({
        code: 403,
        msg: '参数类型错误',
        data: date
      })
    }
    const startDate = new Date(date)
    const endDate = new Date(date)
    startDate.setHours(0)
    startDate.setMinutes(0)
    startDate.setSeconds(0)
    startDate.setMilliseconds(0)
    endDate.setHours(23)
    endDate.setMinutes(59)
    endDate.setSeconds(59)
    endDate.setMilliseconds(999)
    return this.ctx.model.Dining.find({
      $and: [
        { pick_start: { $gte: startDate } },
        { pick_end: { $lte: endDate } }
      ]
    })
  }

  async getDinings (diningIDs) {
    return this.ctx.model.Dining.find({
      _id: { $in: diningIDs }
    })
  }

  async getDiningByID (diningID) {
    return this.ctx.model.Dining.findById(diningID)
  }

  async getFuturePickable () {
    return this.ctx.model.Dining.find({
      pick_end: { $gt: Date.now() }
    })
  }

  async setRequireRoll (diningId, requireRoll = false) {
    return this.ctx.model.Dining.updateOne({
      _id: diningId
    }, {
      requireRoll
    })
  }

  async setPosterGenerated (diningId) {
    return this.ctx.model.Dining.updateOne({
      _id: diningId
    }, {
      posterGenerated: true
    })
  }
}

module.exports = DiningService
