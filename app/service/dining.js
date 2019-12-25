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
    const orderStartTimeAfterStartTime = {
      order_start: {
        $gt: startTime,
      },
    };
    const orderEndTimeBeforeEndTime = {
      order_end: {
        $lt: endTime,
      },
    };
    // 选取取餐时间开始大于选定时间头，而终止时间小于选定时间末尾
    return await DiningModel.find({
      $and: [
        orderStartTimeAfterStartTime,
        orderEndTimeBeforeEndTime,
      ],
    });
  }

  async addNewDining(ding) {
    const ctx = this.ctx;
    const DiningModel = ctx.model.Dining;
    const findList = ding.menu(item => ({
      _id: item,
    }));
    const res = await DiningModel.find({
      $or: findList,
    }, commonFilter);
    if (res.length !== findList.length) {
      throw new HttpError({
        code: 403,
        msg: '存在错误的 menu id',
        data: {findList: ding.menu, result: res.map(_ => _._id)},
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
    // TODO: 重复操作合并
    const findList = ding.menu(item => ({
      _id: item,
    }));
    const res = await DiningModel.find({
      $or: findList,
    }, commonFilter);
    if (res.length !== findList.length) {
      throw new HttpError({
        code: 403,
        msg: '存在错误的 menu id',
        data: {findList: ding.menu, result: res.map(_ => _._id)},
      });
    }
    return await DiningModel.findByIdAndUpdate(id, {
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

  async deleteDiningById(id) {
    const ctx = this.ctx;
    const DiningModel = ctx.model.Dining;
    return await DiningModel.findByIdAndDelete(id);
  }


}

module.exports = DiningService;
