'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.post('/api/v1/:action', controller.proxy.index);
  router.get('/api/v1/:action', controller.proxy.index);
  router.post('/wework_auth', controller.wework.login);
};
