'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  router.post('/api/user/login', controller.users.login);
  router.resources('user', '/api/admin/users', controller.users);
  router.post('/api/user/wework', controller.wework.login);

  // admin
  router.post('/admin/user/list', controller.admin.userList);
  router.get('/admin/dish/list', controller.admin.dishList);
  router.post('/admin/dish', controller.admin.newDish);
  router.get('/admin/dining/:startTime/:endTime', controller.admin.diningByTime);
  router.post('/admin/dining', controller.admin.newDining);
  router.put('/admin/dining/:id', controller.admin.updateDining);
  router.delete('/admin/dinings', controller.admin.deleteDiningByIds);
  router.get('/admin/users', controller.admin.users);
  router.get('/admin/order/:startTime/:endTime', controller.admin.orderByUserIdAndTime);
  router.get('/admin/dish/:id', controller.admin.updateDish);
};
