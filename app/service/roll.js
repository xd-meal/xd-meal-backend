const Service = require('egg').Service
const HttpError = require('../helper/error')

class RollService extends Service {
  async findRollTicketByUserAndDiningIDs (userID, diningIDs) {
    return this.ctx.model.Roll.find({
      uid: userID,
      dining_id: { $in: diningIDs }
    })
  }

  async doRoll () {
    const ctx = this.ctx
    const redis = ctx.app.redis
    if (await redis.get('xdmeal_is_rolling')) {
      return
    }
    await redis.set('xdmeal_is_rolling', 1)
    const rollDinings = await redis.keys('dining_roll_*')
    if (!rollDinings.length) {
      this.logger.info('Roll triggered but nothing to roll')
      return {
        code: 0,
        msg: 'NOTHING_TO_ROLL'
      }
    }
    const globalWin = {}
    this.logger.info('Starting to roll with dining list', rollDinings)
    for (let index = 0; index < rollDinings.length; index++) {
      const diningId = rollDinings[index].slice(12)
      const thisDining = await ctx.model.Dining.findOne({ _id: diningId })
      if (!thisDining) {
        this.logger.info('Invalid dining in redis, deleting', diningId)
        await redis.del(rollDinings[index])
        continue
      }
      if (!thisDining.requireRoll) {
        this.logger.info('Invalid dining with requireRoll false in redis, deleting', diningId)
        await redis.del(rollDinings[index])
        continue
      }
      const orderEnd = thisDining.order_end
      console.log(orderEnd.getTime())
      if (orderEnd && orderEnd.getTime() > Date.now()) {
        this.logger.info('Dining order is not finished yet, continue', diningId)
        continue
      }
      const currentDining = await this.getRollDiningData(diningId)
      this.logger.info('Starting dining roll', diningId)
      for (let index = 0; index < currentDining.length; index++) {
        const currentMealRoll = currentDining[index]
        this.logger.info('Starting meal roll', currentMealRoll.meal._id)
        const orderSession = await ctx.model.Order.startSession()
        const rollSession = await ctx.model.Roll.startSession()
        const userSession = await ctx.model.User.startSession()
        orderSession.startTransaction()
        rollSession.startTransaction()
        userSession.startTransaction()
        try {
          let winArr = []
          const loseArr = []
          if (currentMealRoll.users.length <= currentMealRoll.meal.limit) {
            winArr = currentMealRoll.users.map(_ => _._id)
          } else {
            currentMealRoll.users.forEach(user => {
              if (user.is_vip) {
                user.lucky_bonus += 50000
              }
              user.lucky_bonus += parseInt(Math.random() * 100)
            })
            currentMealRoll.users.sort((a, b) => {
              return b.lucky_bonus - a.lucky_bonus
            })
            const win = currentMealRoll.users.splice(0, currentMealRoll.meal.limit)
            win.forEach(el => {
              winArr.push(el._id.toString())
              if (el.wework_userid) {
                if (!globalWin[el.corp]) {
                  global[el.corp] = new Set()
                }
                global[el.corp].add(el.wework_userid)
              }
            })
            currentMealRoll.users.forEach(el => {
              loseArr.push(el._id.toString())
            })
          }
          await ctx.service.users.batchAddLuckyBonus(loseArr, 5, userSession)
          await ctx.service.users.batchSetLuckyBonus(winArr, 0, userSession)
          await ctx.service.order.rollBatchReplaceDish(winArr, diningId, currentMealRoll.meal._id, orderSession)
          await orderSession.commitTransaction()
          await rollSession.commitTransaction()
          await userSession.commitTransaction()
          orderSession.endSession()
          rollSession.endSession()
          userSession.endSession()
        } catch (error) {
          await orderSession.abortTransaction()
          await rollSession.abortTransaction()
          await userSession.abortTransaction()
          this.logger.error('Error occurred in roll stage', error)
        }
      }
      await ctx.service.dining.setRequireRoll(diningId, false)
    }
    await redis.del('xdmeal_is_rolling')
    ctx.service.wework.sendRollWinnerMsg(globalWin)
    return true
  }

  async getRollDiningData (diningId) {
    const ctx = this.ctx
    const ObjectId = require('mongoose').Types.ObjectId
    const RollModel = ctx.model.Roll
    const res = await RollModel.aggregate([
      {
        $match: {
          dining_id: new ObjectId(diningId)
        }
      }, {
        $lookup: {
          from: 'user',
          localField: 'uid',
          foreignField: '_id',
          as: 'user'
        }
      }, {
        $group: {
          _id: {
            dining_id: '$dining_id',
            menu_id: '$menu_id'
          },
          users: {
            $push: {
              $arrayElemAt: [
                '$user', 0
              ]
            }
          }
        }
      }, {
        $lookup: {
          from: 'dining',
          localField: '_id.dining_id',
          foreignField: '_id',
          as: 'dining'
        }
      }, {
        $unwind: {
          path: '$dining'
        }
      }
    ])
    for (let index = 0; index < res.length; index++) {
      const el = res[index]
      el.meal = el.dining.menu.find(menuEl => menuEl._id.toString() === el._id.menu_id.toString())
    }
    return res
  }

  async performBatchRoll (req, orderableDinings) {
    const ctx = this.ctx
    const session = await ctx.model.Roll.startSession()
    session.startTransaction()
    try {
      for (const diningId in req) {
        if (Object.prototype.hasOwnProperty.call(req, diningId)) {
          const menuId = req[diningId]
          if (!orderableDinings[diningId]) {
            throw new HttpError({
              code: 403,
              msg: '摇号选择列表包含非可选餐次'
            })
          }
          if (menuId) {
            const menuOption = orderableDinings[diningId].menu.find(el => el._id.toString() === menuId)
            if (!menuOption) {
              throw new HttpError({
                code: 403,
                msg: '摇号选择列表包含无效菜品 ID'
              })
            }
            if (!menuOption.limit) {
              throw new HttpError({
                code: 403,
                msg: '摇号选择列表包含非限量菜品'
              })
            }
            await this.ctx.model.Roll.updateOne({
              uid: ctx.session.user._id,
              dining_id: diningId
            }, {
              uid: ctx.session.user._id,
              dining_id: diningId,
              menu_id: menuId,
              hit: false
            }, {
              upsert: true,
              session
            })
          } else {
            await this.ctx.model.Roll.deleteOne({
              uid: ctx.session.user._id,
              dining_id: diningId
            }, {
              session
            })
          }
        }
      }
      await session.commitTransaction()
      session.endSession()
      return { code: 0 }
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      return error
    }
  }

  async setRollTicketHit (userId, diningId, menuId, hit = false) {
    return this.ctx.model.Roll.updateOne({
      uid: userId,
      dining_id: diningId,
      menu_id: menuId
    }, {
      hit
    })
  }

  async updateRollTicket (userId, diningId, menuId) {
    return this.ctx.model.Roll.updateOne({
      uid: userId,
      dining_id: diningId
    }, {
      uid: userId,
      dining_id: diningId,
      menu_id: menuId,
      hit: false
    }, {
      upsert: true
    })
  }

  async removeRollTicket (userId, diningId) {
    return this.ctx.model.Roll.deleteOne({
      uid: userId,
      dining_id: diningId
    })
  }
}

module.exports = RollService
