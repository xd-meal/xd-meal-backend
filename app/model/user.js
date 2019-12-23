'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const UserSchema = new Schema({
    username: {
      type: String,
    },
    password: {
      type: String,
    },
    wework_userid: {
      type: String,
    },
    corp: {
      type: String,
    },
    email: {
      type: String,
    },
  });
  return mongoose.model('User', UserSchema, 'user');
};
