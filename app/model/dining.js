module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema
  const DiningMenuItemSchema = new Schema(
    {
      _id: {
        type: Schema.Types.ObjectId
      },
      title: {
        type: String
      },
      desc: {
        type: String
      },
      supplier: {
        type: String
      },
      limit: {
        type: Number
      }
    }
  )
  const DiningSchema = new Schema({
    order_start: {
      type: Date
    },
    order_end: {
      type: Date
    },
    pick_start: {
      type: Date
    },
    pick_end: {
      type: Date
    },
    stat_type: {
      // 0 - 人数 1 参品
      type: Number
    },
    menu: {
      type: [DiningMenuItemSchema]
    },
    title: {
      type: String
    },
    requireRoll: {
      type: Boolean,
      default: false
    },
    posterGenerated: {
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
  return mongoose.model('Dining', DiningSchema, 'dining')
}
