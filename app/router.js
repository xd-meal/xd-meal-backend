'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/api/v1', controller.home.index);

  // login
  router.post('/api/v1/user/login', controller.users.login);
  router.get('/api/v1/user/wework', controller.users.wework);

  // logout
  router.get('/api/v1/user/logout', controller.users.logout);

  // admin
  router.post('/api/v1/admin/user/list', controller.admin.userList);
  router.get('/api/v1/admin/dish/list', controller.admin.dishList);
  router.post('/api/v1/admin/dish', controller.admin.newDish);
  router.get('/api/v1/admin/dining/:startTime/:endTime', controller.admin.diningByTime);
  router.post('/api/v1/admin/dining', controller.admin.newDining);
  router.put('/api/v1/admin/dining/:id', controller.admin.updateDining);
  router.delete('/api/v1/admin/dining/:id', controller.admin.deleteDiningById);
  router.get('/api/v1/admin/users', controller.admin.users);
  router.get('/api/v1/admin/order/:startTime/:endTime', controller.admin.orderByUserIdAndTime);
  router.put('/api/v1/admin/dish/:id', controller.admin.updateDish);
};
