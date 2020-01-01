'use strict';
const Service = require('egg').Service;
const HttpError = require('../helper/error');

const commonFilter = {
  __v: 0,
};

class DiningService extends Service {
  async findDiningByTime(setting) {
    const ctx = this.ctx;
    const {
      startTime,
      endTime,
    } = setting;
    const DiningModel = ctx.model.Dining;
    const pickStartTimeAfterStartTime = {
      pick_start: {
        $gt: startTime,
      },
    };
    const pickEndTimeBeforeEndTime = {
      pick_end: {
        $lt: endTime,
      },
    };
    // 选取取餐时间开始大于选定时间头，而终止时间小于选定时间末尾
    return await DiningModel.find({
      $and: [
        pickStartTimeAfterStartTime,
        pickEndTimeBeforeEndTime,
      ],
    });
  }

  async addNewDining(ding) {
    const ctx = this.ctx;
    const DiningModel = ctx.model.Dining;
    const DishModel = ctx.model.Dish;
    const findList = ding.menu.map(item => ({
      _id: item,
    }));
    const res = await DishModel.find({
      $or: findList,
    }, commonFilter);
    if (res.length !== findList.length) {
      throw new HttpError({
        code: 403,
        msg: '存在错误的 menu id',
        data: { findList: ding.menu, result: res.map(_ => _._id) },
      });
    }
    return await DiningModel.create({
      order_start: ding.order_start,
      order_end: ding.order_end,
      pick_start: ding.pick_start,
      pick_end: ding.pick_end,
      stat_type: ding.stat_type,
      menu: res.map(_ => ({
        _id: _._id,
        title: _.title,
        desc: _.desc,
        suppier: _.suppier,
      })),
    });
  }

  async updateDining(ding, id) {
    const ctx = this.ctx;
    const DiningModel = ctx.model.Dining;
    const DishModel = ctx.model.Dish;
    // TODO: 重复操作合并
    const findList = ding.menu.map(item => ({
      _id: item,
    }));
    const res = await DishModel.find({
      $or: findList,
    }, commonFilter);
    if (res.length !== findList.length) {
      throw new HttpError({
        code: 403,
        msg: '存在错误的 menu id',
        data: { findList: ding.menu, result: res.map(_ => _._id) },
      });
    }
    return DiningModel.findByIdAndUpdate(id, {
      order_start: ding.order_start,
      order_end: ding.order_end,
      pick_start: ding.pick_start,
      pick_end: ding.pick_end,
      stat_type: ding.stat_type,
      menu: res.map(_ => ({
        _id: _._id,
        title: _.title,
        desc: _.desc,
        suppier: _.suppier,
      })),
    }, { new: true });
  }

  async deleteDiningById(id) {
    const ctx = this.ctx;
    const DiningModel = ctx.model.Dining;
    return await DiningModel.findByIdAndDelete(id);
  }

  async getAllOrderable() {
    const ctx = this.ctx;
    const DiningModel = ctx.model.Dining;
    return await DiningModel.find({
      $and: [
        {
          order_start: { $lt: Date.now() },
          order_end: { $gt: Date.now() },
        },
        { stat_type: 1 },
      ],
    });
  }

  async getAllPickableDinings() {
    const ctx = this.ctx;
    const DiningModel = ctx.model.Dining;
    return await DiningModel.find({
      pick_start: { $lt: Date.now() },
      pick_end: { $gt: Date.now() },
    });
  }

  async getOrderableDinings(diningIDs) {
    return await this.ctx.model.Dining.find({
      $and: [
        {
          order_start: { $lt: Date.now() },
          order_end: { $gt: Date.now() },
        },
        { _id: { $in: diningIDs } },
      ],
    });
  }

  async getDiningByID(diningID) {
    return await this.ctx.model.Dining.findById(diningID);
  }
}

module.exports = DiningService;
