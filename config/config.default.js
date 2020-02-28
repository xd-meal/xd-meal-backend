/* eslint valid-jsdoc: "off" */

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {}

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1577081161238_6397'

  // add your middleware config here
  config.middleware = []
  // add your user config here
  config.security = {
    csrf: {
      enable: false
    }
  }
  config.validate = {}
  // config.redis = {
  //   client: {
  //     port: 6379, // Redis port
  //     host: '127.0.0.1', // Redis host
  //     password: 'auth',
  //     db: 0
  //   },
  //   agent: true
  // }
  config.wework = {
    secret: {
      xd: '',
      xdg: '',
      tap: ''
    },
    corpID: {
      xd: '',
      xdg: '',
      tap: ''
    },
    agentID: {
      xd: '',
      xdg: '',
      tap: ''
    }
  }
  config.mongoose = {
    client: {
      // url: 'mongodb://127.0.0.1/example',
      options: {
        useCreateIndex: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
      }
    }
  }
  config.logger = {
    outputJSON: true
  }
  config.session = {
    key: 'XD-MEAL-SESSION',
    maxAge: 30 * 3600 * 1000,
    // XXX: 不确定是否有安全问题，前端需要获取以判断登陆情况
    httpOnly: false,
    renew: true
  }
  config.pos = {
    keys: []
  }
  return {
    ...config,
    notfound: {
      pageUrl: '/404'
    },
    onerror: {
      accepts () {
        return 'json'
      },
      all (err, ctx) {
        ctx.type = 'json'
        // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
        ctx.app.emit('error', err, ctx)

        const status = err.status || 500
        // 生产环境时 500 错误的详细错误内容不返回给客户端，因为可能包含敏感信息
        const error = status === 500 && ctx.app.config.env === 'prod'
          ? 'Internal Server Error'
          : err.message

        // 从 error 对象上读出各个属性，设置到响应中
        if (error) {
          ctx.body = { msg: error, innerError: true }
        } else {
          // msg 和 data 信息是人工写入的没有敏感信息
          // 并且理论上是前端用于直接输出到页面上的，所以这里不做约束
          ctx.body = { msg: err.msg, data: err.data, innerError: false }
        }
        if (status === 422) {
          // 用于处理异常的 body 内容
          ctx.body.detail = err.errors
        }
        ctx.status = status
      }
    }
  }
}
