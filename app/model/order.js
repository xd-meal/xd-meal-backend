'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const OrderSchema = new Schema({
    uid: {
      type: Schema.Types.ObjectId,
    },
    dining_id: {
      type: Schema.Types.ObjectId,
    },
    menu_id: {
      type: Schema.Types.ObjectId,
    },
    picked: {
      type: Boolean,
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
