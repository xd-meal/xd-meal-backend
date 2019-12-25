'use strict';
const Service = require('egg').Service;
const HttpError = require('../helper/error');

const commonFilter = {
  __v: 0,
};

class DishService extends Service {
  async dishList() {
    const ctx = this.ctx;
    const dishModel = ctx.model.Dish;
    return await dishModel.limit(1000).find({}, commonFilter);
  }

  async addDish(dish) {
    const ctx = this.ctx;
    const dishModel = ctx.model.Dish;
    return await dishModel.create({
      title: dish.title,
      desc: dish.desc,
      supplier: dish.supplier,
    });
  }

  async updateDish(dish, id) {
    const ctx = this.ctx;
    const dishModel = ctx.model.Dish;
    return await dishModel.findByIdAndUpdate(id, {
      title: dish.title,
      desc: dish.desc,
      supplier: dish.supplier,
    });
  }
}

module.exports = DishService;
