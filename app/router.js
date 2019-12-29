'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const isAdmin = app.middleware.isAdmin;
  const isLoggedin = app.middleware.isLoggedin;

  router.get('/', controller.home.index);
  router.get('/api/v1', controller.home.index);

  // login
  router.post('/api/v1/user/login', controller.users.login);
  router.get('/api/v1/user/wework', controller.users.wework);

  // logout
  router.get('/api/v1/user/logout', isLoggedin, controller.users.logout);

  // my dish
  router.get('/api/v1/myDish', isLoggedin, controller.dish.pickingMyDish);

  // get all orderable dining
  // router.get('api/v1/dining/list');

  // admin
  router.post('/api/v1/admin/user/list', isAdmin, controller.admin.userList);
  router.get('/api/v1/admin/dish/list', isAdmin, controller.admin.dishList);
  router.post('/api/v1/admin/dish', isAdmin, controller.admin.newDish);
  router.get('/api/v1/admin/dining/:startTime/:endTime', isAdmin, controller.admin.diningByTime);
  router.post('/api/v1/admin/dining', isAdmin, controller.admin.newDining);
  router.put('/api/v1/admin/dining/:id', isAdmin, controller.admin.updateDining);
  router.delete('/api/v1/admin/dining/:id', isAdmin, controller.admin.deleteDiningById);
  router.get('/api/v1/admin/users', isAdmin, controller.admin.users);
  router.get('/api/v1/admin/order/:startTime/:endTime', isAdmin, controller.admin.orderByUserIdAndTime);
  router.put('/api/v1/admin/dish/:id', isAdmin, controller.admin.updateDish);
};
