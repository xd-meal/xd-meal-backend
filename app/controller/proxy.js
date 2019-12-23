'use strict';

const Controller = require('egg').Controller;
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});
const TARGET = 'http://127.0.0.1';

class ProxyController extends Controller {
  async index() {
    proxy.web(this.ctx.request, this.ctx.response, { target: TARGET });
  }
}

module.exports = ProxyController;
