'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.post('/wework_auth', controller.wework.login);

  router.post('/user/login', controller.users.login);
  router.resources('user', '/api/admin/users', controller.users);
};
