module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema
  const RollSchema = new Schema({
    dining_id: {
      type: Schema.Types.ObjectId
    },
    menu_id: {
      type: Schema.Types.ObjectId
    },
    uid: {
      type: Schema.Types.ObjectId
    },
    hit: {
      type: Boolean,
      default: false
    },
    createTime: {
      type: Date,
      default: Date.now
    },
    updateTime: {
      type: Date,
      default: Date.now
    }
  }, {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  RollSchema.index({ dining_id: 1, uid: 1 }, { unique: true })
  return mongoose.model('Roll', RollSchema, 'roll')
}
