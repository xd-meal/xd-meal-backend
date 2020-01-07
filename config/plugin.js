
/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   //   enable: true,
  //   // }
  // mongo db
  mongoose: {
    enable: true,
    package: 'egg-mongoose'
  },
  session: true,
  // 验证插件
  validate: {
    enable: true,
    package: 'egg-validate'
  },
  redis: {
    enable: true,
    package: 'egg-redis'
  },
  userrole: {
    enable: true,
    package: 'egg-userrole'
  },
  sessionRedis: {
    enable: true,
    package: 'egg-session-redis'
  }
}
