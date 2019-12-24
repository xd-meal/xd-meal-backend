'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   //   enable: true,
  //   // }
  // mongo db
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },
  // JSON web token
  jwt: {
    enable: true,
    package: 'egg-jwt',
  },
  // 验证插件
  validate: {
    enable: true,
    package: 'egg-validate',
  },
};
