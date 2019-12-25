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
class AdminController extends Controller {
  // csv 导入 POST
  async userList() {
    const ctx = this.ctx;
    const userService = ctx.service.users;
    const params = filterParams(ctx.request.body, userImportRule);
    ctx.validate(userImportRule, params);
    this.ctx.body = await userService.updateList(params.list);
  }

  // 获取餐品列表
  async dishList() {

  }

  // 添加餐品接口
  async newDish() {

  }

  // 获取指定时间区间的餐次列表
  async diningByTime() {

  }

  // 增加餐次
  async newDining() {

  }

  // 更新餐次
  async updateDining() {

  }

  // 按id列表删除餐次
  async deleteDiningByIds() {
  }

  // 查询用户列表
  async users() {

  }

  // 查询用户指定时间内的点餐记录
  async orderByUserIdAndTime() {

  }

  // 修改餐品接口
  async updateDish() {

  }
}

module.exports = AdminController;
