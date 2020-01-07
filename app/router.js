
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app
  const isAdmin = app.middleware.isAdmin
  const isLoggedin = app.middleware.isLoggedin
  const isAuthedPos = app.middleware.isAuthedPos
  const isModerator = app.middleware.isModerator

  // login
  router.post('/api/v1/user/login', controller.users.login)
  router.get('/api/v1/user/wework', controller.users.wework)

  // logout
  router.get('/api/v1/user/logout', isLoggedin, controller.users.logout)

  // user
  router.get('/api/v1/user/profile', isLoggedin, controller.users.userProfile)
  router.put('/api/v1/user/config', isLoggedin, controller.users.userUpdateConfig)
  router.put('/api/v1/user/reset_pwd', isLoggedin, controller.users.resetPsw)

  // my
  router.get('/api/v1/myDish', isLoggedin, controller.dish.pickingMyDish)
  router.get('/api/v1/orders', isLoggedin, controller.dining.getAllUnpickedOrdered)

  // dining
  router.get('/api/v1/dining/list', isLoggedin, controller.dining.getAllOrderable)
  router.post('/api/v1/order', isLoggedin, controller.dining.performOrder)

  // pos machine endpoints
  router.get('/api/v1/token/:token', isAuthedPos, controller.pos.performPick)

  // admin
  router.post('/api/v1/admin/user/list', isAdmin, controller.admin.userList)
  router.get('/api/v1/admin/dish/list', isAdmin, controller.admin.dishList)
  router.post('/api/v1/admin/dish', isAdmin, controller.admin.newDish)
  router.get('/api/v1/admin/dining/:startTime/:endTime', isAdmin, controller.admin.diningByTime)
  router.post('/api/v1/admin/dining', isAdmin, controller.admin.newDining)
  router.put('/api/v1/admin/dining/:id', isAdmin, controller.admin.updateDining)
  router.delete('/api/v1/admin/dining/:id', isAdmin, controller.admin.deleteDiningById)
  router.get('/api/v1/admin/users', isAdmin, controller.admin.users)
  router.get('/api/v1/admin/order/:startTime/:endTime', isAdmin, controller.admin.orderByUserIdAndTime)
  router.put('/api/v1/admin/dish/:id', isAdmin, controller.admin.updateDish)

  // reports
  router.post('/api/v1/report/order_count', isModerator, controller.report.orderCount)
}
