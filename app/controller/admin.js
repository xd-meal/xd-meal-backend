
const Controller = require('egg').Controller
const HttpError = require('../helper/error')
const filterParams = require('../helper/filter')

const userImportRule = {
  list: {
    type: 'array',
    itemType: 'object',
    rule: {
      username: 'string',
      department: 'string',
      wechat_corpid: { type: 'string', required: true },
      email: 'string',
      password: { type: 'string', required: false }
    }
  }
}
const addNewDishRule = {
  title: 'string',
  desc: 'string',
  supplier: 'string'
}

const updateDishRule = {
  title: 'string',
  desc: 'string',
  supplier: 'string'
}

const addNewDiningRule = {
  title: 'string',
  order_start: 'number',
  order_end: 'number',
  pick_start: 'number',
  pick_end: 'number',
  stat_type: { type: 'enum', values: [0, 1], required: false },
  menu: {
    type: 'array',
    itemType: 'string'
  }
}

const updateDiningRule = addNewDiningRule

const findOrderByUserIdAndTimeRule = {
  userId: 'string'
}
class AdminController extends Controller {
  // csv 导入 POST /admin/user/list
  async userList () {
    const ctx = this.ctx
    const userService = ctx.service.users
    const params = filterParams(ctx.request.body, userImportRule)
    ctx.validate(userImportRule, params)
    if (ctx.session.user.role < 2) {
      if (params.list.filter(el => el.wechat_corpid !== ctx.session.user.wechat_corpid).length) {
        throw new HttpError({
          code: 403,
          msg: '分管只能添加同企业帐号'
        })
      }
    }
    ctx.body = await userService.importList(params.list)
  }

  // 获取餐品列表 GET /admin/dish/list
  async dishList () {
    const ctx = this.ctx
    const dishService = ctx.service.dish
    // 无参数，不校验
    ctx.body = await dishService.dishList()
  }

  // 添加餐品接口 POST /admin/dish
  async newDish () {
    const ctx = this.ctx
    const dishService = ctx.service.dish
    const params = filterParams(ctx.request.body, addNewDishRule)
    ctx.validate(addNewDishRule, params)
    ctx.body = await dishService.addDish(params)
  }

  // 获取指定时间区间的餐次列表 GET /admin/dining/:startTime/:endTime
  async diningByTime () {
    const ctx = this.ctx
    const startTime = ctx.params.startTime
    const endTime = ctx.params.endTime
    const diningService = ctx.service.dining
    // TODO: 时间校验
    ctx.body = await diningService.findDiningByTime({
      startTime,
      endTime
    })
  }

  // 增加餐次 POST /admin/dining
  async newDining () {
    const ctx = this.ctx
    const diningService = ctx.service.dining
    const params = filterParams(ctx.request.body, addNewDiningRule)
    ctx.validate(addNewDiningRule, params)
    ctx.body = await diningService.addNewDining(params)
  }

  // 更新餐次 PUt /admin/dining/:id
  async updateDining () {
    const ctx = this.ctx
    const diningService = ctx.service.dining
    const id = ctx.params.id
    const params = filterParams(ctx.request.body, addNewDiningRule)
    ctx.validate(updateDiningRule, params)
    ctx.body = await diningService.updateDining(params, id)
  }

  // 按id列表删除餐次 DELETE /admin/dinings/:id
  async deleteDiningById () {
    const ctx = this.ctx
    const diningService = ctx.service.dining
    const orderService = ctx.service.order
    const id = ctx.params.id
    await diningService.deleteDiningById(id)
    await orderService.deleteAllOrdersByDining(id)
    ctx.body = {
      id
    }
  }

  // 查询用户列表 GET /admin/users
  async users () {
    const ctx = this.ctx
    const userService = ctx.service.users
    ctx.body = await userService.findAllUsers()
  }

  // 查询用户指定时间内的点餐记录
  async orderByUserIdAndTime () {
    const ctx = this.ctx
    const startTime = ctx.params.startTime
    const endTime = ctx.params.endTime
    const orderService = ctx.service.order
    const params = filterParams(ctx.request.body, findOrderByUserIdAndTimeRule)
    await orderService.findOrderByUserIdAndTimeRule({
      id: params.id,
      startTime,
      endTime
    })
  }

  // 修改餐品接口 PUT /admin/dish/:id
  async updateDish () {
    const ctx = this.ctx
    const dishService = ctx.service.dish
    const id = ctx.params.id
    const params = filterParams(ctx.request.body, updateDishRule)
    ctx.validate(updateDishRule, params)
    ctx.body = await dishService.updateDish(params, id)
  }
}

module.exports = AdminController
