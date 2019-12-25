'use strict';

const Controller = require('egg').Controller;
const filterParams = require('../helper/filter');

const userImportRule = {
  list: {
    type: 'array',
    itemType: 'object',
    rule: {
      username: 'string',
      department: 'string',
      corp: 'string',
      email: 'string',
    },
  },
};
const addNewDishRule = {
  title: 'string',
  desc: 'string',
  supplier: 'string',
};

const updateDishRule = {
  title: 'string',
  desc: 'string',
  supplier: 'string',
};

const addNewDiningRule = {
  order_start: 'string',
  order_end: 'string',
  pick_start: 'string',
  pick_end: 'string',
  stat_type: { type: 'enum', values: [ 0, 1 ] },
  menu: {
    type: 'array',
    itemType: 'string',
  },
};

const updateDiningRule = addNewDiningRule;

const findOrderByUserIdAndTimeRule = {
  userId: 'string',
};
class AdminController extends Controller {
  // csv 导入 POST
  async userList() {
    const ctx = this.ctx;
    const userService = ctx.service.users;
    const params = filterParams(ctx.request.body, userImportRule);
    ctx.validate(userImportRule, params);
    ctx.body = await userService.updateList(params.list);
  }

  // 获取餐品列表
  async dishList() {
    const ctx = this.ctx;
    const dishService = ctx.service.dish;
    // 无参数，不校验
    ctx.body = await dishService.dishList();
  }

  // 添加餐品接口
  async newDish() {
    const ctx = this.ctx;
    const dishService = ctx.service.dish;
    const params = filterParams(ctx.request.body, addNewDishRule);
    ctx.validate(addNewDishRule, params);
    ctx.body = await dishService.addDish();
  }

  // 获取指定时间区间的餐次列表
  async diningByTime() {
    const ctx = this.ctx;
    const startTime = ctx.params.startTime;
    const endTime = ctx.params.endTime;
    const diningService = ctx.service.dish;
    // TODO: 时间校验
    ctx.body = await diningService.findDiningByTime({
      startTime,
      endTime,
    });
  }

  // 增加餐次
  async newDining() {
    const ctx = this.ctx;
    const diningService = ctx.service.dining;

    const params = filterParams(ctx.request.body, addNewDiningRule);
    ctx.validate(addNewDiningRule, params);
    await diningService.addNewDining(params);
  }

  // 更新餐次
  async updateDining() {
    const ctx = this.ctx;
    const diningService = ctx.service.dining;
    const id = ctx.params.id;
    const params = filterParams(ctx.request.body, addNewDiningRule);
    ctx.validate(updateDiningRule, params);
    await diningService.updateDining(params, id);
  }

  // 按id列表删除餐次
  async deleteDiningByIds() {
    const ctx = this.ctx;
    const diningService = ctx.service.dining;
    const id = ctx.params.id;
    await diningService.deleteDiningById(id);
  }

  // 查询用户列表
  async users() {
    const ctx = this.ctx;
    const userService = ctx.service.users;
    ctx.body = await userService.findAllUsers();
  }

  // 查询用户指定时间内的点餐记录
  async orderByUserIdAndTime() {
    const ctx = this.ctx;
    const startTime = ctx.params.startTime;
    const endTime = ctx.params.endTime;
    const userService = ctx.service.users;
    const params = filterParams(ctx.request.body, findOrderByUserIdAndTimeRule);
  }

  // 修改餐品接口
  async updateDish() {
    const ctx = this.ctx;
    const dishService = ctx.service.dish;
    const id = ctx.params.id;
    const params = filterParams(ctx.request.body, updateDishRule);
    ctx.validate(updateDishRule, params);
    ctx.body = await dishService.updateDish(params, id);
  }
}

module.exports = AdminController;
