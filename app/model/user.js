'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const UserSchema = new Schema({
    username: {
      type: String,
      trim: true,
    },
    psw_salt: {
      type: String,
    },
    password: {
      type: String,
    },
    wework_userid: {
      type: String,
    },
    wechat_corpid: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      index: {
        unique: true,
        partialFilterExpression: { email: { $type: 'string' } },
      },
    },
    avatar: {
      type: String,
    },
    role: {
      type: Number,
    },
    department: {
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
  return mongoose.model('User', UserSchema, 'user');
};
