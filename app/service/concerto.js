const Service = require('egg').Service
const HttpError = require('../helper/error')
// const ObjectId = require('mongoose').Types.ObjectId

const Canvas = require('canvas')
const fs = require('fs')
const path = require('path')

Canvas.registerFont('concerto/FZPIXEL.ttf', { family: 'FZPIXEL' })

class ConcertoService extends Service {
  async InjectByDiningItem (dining) {
    for (let menuIndex = 0; menuIndex < dining.menu.length; menuIndex++) {
      if (menuIndex > 3) {
        break
      }
      const feedConfig = this.app.config.concerto.find(e => {
        return e.item === menuIndex
      })
      if (!feedConfig) {
        continue
      }
      const dishItem = dining.menu[menuIndex]
      const imgBuffer = await this.__generateBuffer(menuIndex, dishItem)
      const contentInsertion = await this.app.mysql.insert('contents', {
        name: dining.title + '_' + dishItem.title,
        duration: 8,
        start_time: new Date(dining.pick_start - (28800 * 1000)),
        end_time: new Date(dining.pick_end - (28800 * 1000)),
        user_id: 3,
        kind_id: 1,
        created_at: this.app.mysql.literals.now,
        updated_at: this.app.mysql.literals.now,
        type: 'Graphic'
      })
      if (!contentInsertion.affectedRows) {
        throw new HttpError({
          code: 403,
          msg: 'Content 记录生成失败'
        })
      }
      const mediaInsertion = await this.app.mysql.insert('media', {
        attachable_id: contentInsertion.insertId,
        attachable_type: 'Content',
        key: 'original',
        file_name: Date.now() + '.jpg',
        file_type: 'image/jpeg',
        file_size: imgBuffer.length,
        file_data: imgBuffer,
        created_at: this.app.mysql.literals.now,
        updated_at: this.app.mysql.literals.now
      })
      if (!mediaInsertion.affectedRows) {
        throw new HttpError({
          code: 403,
          msg: 'Media 记录生成失败'
        })
      }
      const SubmissionsInsertion = await this.app.mysql.insert('submissions', {
        content_id: contentInsertion.insertId,
        feed_id: feedConfig.feed,
        moderation_flag: 1,
        moderator_id: 3,
        duration: 8,
        created_at: this.app.mysql.literals.now,
        updated_at: this.app.mysql.literals.now
      })
      if (!SubmissionsInsertion.affectedRows) {
        throw new HttpError({
          code: 403,
          msg: 'Submissions 记录生成失败'
        })
      }
    }
    return {
      code: 0,
      msg: '海报生成完毕'
    }
  }

  async __generateBuffer (dishIndex, dishItem) {
    const canvas = Canvas.createCanvas(1920, 1080)
    const canvasCtx = canvas.getContext('2d')
    canvasCtx.fillStyle = 'black'
    canvasCtx.fillRect(0, 0, 1920, 1080)
    canvasCtx.lineWidth = 1
    if (!fs.existsSync(path.join('concerto', dishIndex + '.jpg'))) {
      throw new HttpError({
        code: 403,
        msg: '找不到海报模板' + dishIndex
      })
    }
    const img = await Canvas.loadImage(path.join('concerto', dishIndex + '.jpg'))
    canvasCtx.drawImage(img, 0, 0)
    if (dishIndex > 0) {
      canvasCtx.font = '100px "FZPIXEL"'
      canvasCtx.fillStyle = '#554f5b'
      canvasCtx.strokeStyle = '#554f5b'
      canvasCtx.textAlign = 'center'
      canvasCtx.textBaseline = 'middle'
      canvasCtx.fillText(dishItem.title, 950, 173)
      canvasCtx.strokeText(dishItem.title, 950, 173)
      canvasCtx.fillStyle = 'white'
      canvasCtx.strokeStyle = 'white'
      canvasCtx.fillText(dishItem.title, 950, 168)
      canvasCtx.strokeText(dishItem.title, 950, 168)
    } else {
      canvasCtx.font = '40px "FZPIXEL"'
      const list = dishItem.desc.split('\n')
      canvasCtx.textAlign = 'center'
      canvasCtx.textBaseline = 'top'
      canvasCtx.fillStyle = 'white'
      canvasCtx.strokeStyle = 'white'
      canvasCtx.fillText(list[0], 960, 778)
      canvasCtx.fillText(list[1], 960, 848)
      canvasCtx.fillText(list[2], 960, 918)
      canvasCtx.fillText([list[3], list[4], list[5]].join('  '), 960, 988)
      canvasCtx.strokeText(list[0], 960, 778)
      canvasCtx.strokeText(list[1], 960, 848)
      canvasCtx.strokeText(list[2], 960, 918)
      canvasCtx.strokeText([list[3], list[4], list[5]].join('  '), 960, 988)
      canvasCtx.fillStyle = '#554f5b'
      canvasCtx.strokeStyle = '#554f5b'
      canvasCtx.fillText(list[0], 960, 780)
      canvasCtx.fillText(list[1], 960, 850)
      canvasCtx.fillText(list[2], 960, 920)
      canvasCtx.fillText([list[3], list[4], list[5]].join('  '), 960, 990)
      canvasCtx.strokeText(list[0], 960, 780)
      canvasCtx.strokeText(list[1], 960, 850)
      canvasCtx.strokeText(list[2], 960, 920)
      canvasCtx.strokeText([list[3], list[4], list[5]].join('  '), 960, 990)
    }
    return canvas.toBuffer('image/jpeg')
    // const out = fs.createWriteStream(path.join('concerto_test', dishIndex + '.jpg'))
    // await canvas.createJPEGStream().pipe(out)
  }
}
module.exports = ConcertoService
