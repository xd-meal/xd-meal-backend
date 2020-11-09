
const Service = require('egg').Service
// const HttpError = require('../helper/error');

const commonFilter = {
  __v: 0
}

class DishService extends Service {
  async dishList () {
    const ctx = this.ctx
    const dishModel = ctx.model.Dish
    // TODO: migrate to remote search
    return dishModel.find({}, commonFilter)
  }

  async addDish (dish) {
    const ctx = this.ctx
    const dishModel = ctx.model.Dish
    return dishModel.create({
      title: dish.title,
      desc: dish.desc,
      supplier: dish.supplier
    })
  }

  async updateDish (dish, id) {
    const ctx = this.ctx
    const dishModel = ctx.model.Dish
    return dishModel.findByIdAndUpdate(id, {
      title: dish.title,
      desc: dish.desc,
      supplier: dish.supplier
    }, { new: true })
  }

  async getDish (id) {
    const dishModel = this.ctx.model.Dish
    return dishModel.findById(id)
  }
}

module.exports = DishService
