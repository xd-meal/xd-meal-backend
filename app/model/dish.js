'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const DishSchema = new Schema({
    title: {
      type: String,
    },
    desc: {
      type: String,
    },
    supplier: {
      type: String,
    },
    createTime: {
      type: Date,
      default: Date.now,
    },
    updateTime: {
      type: Date,
      default: Date.now,
    },
  }, {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' },
  });
  return mongoose.model('Dish', DishSchema, 'dish');
};
