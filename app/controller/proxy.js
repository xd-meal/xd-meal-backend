'use strict';

const Controller = require('egg').Controller;
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});

class ProxyController extends Controller {
  async index() {
    proxy.web(this.ctx.request.req, this.ctx.response.res, { target: this.config.proxyTarget });
  }
}

module.exports = ProxyController;
