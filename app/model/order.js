'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const OrderSchema = new Schema({
    uid: {
      type: String,
    },
    dining_id: {
      type: String,
    },
    menu_id: {
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
  return mongoose.model('Order', OrderSchema, 'order');
};
