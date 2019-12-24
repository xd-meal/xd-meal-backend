'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const UserSchema = new Schema({
    username: {
      type: String,
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
  });
  return mongoose.model('User', UserSchema, 'user');
};
