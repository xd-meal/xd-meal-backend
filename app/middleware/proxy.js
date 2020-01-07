
const proxy = require('koa-server-http-proxy')

module.exports = (options, app) => {
  return proxy('/api', {
    target: app.config.proxyTarget,
    changeOrigin: true
  })
}
