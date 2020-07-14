module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const UserSchema = new Schema({
    username: {
      type: String,
      trim: true
    },
    psw_salt: {
      type: String
    },
    password: {
      type: String
    },
    wework_userid: {
      type: String
    },
    corp: {
      type: String,
      required: true
    },
    channel: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      sparse: true
    },
    avatar: {
      type: String
    },
    role: {
      type: Number,
      default: 0,
      immutable: true
    },
    department: {
      type: String
    },
    config: {
      type: Schema.Types.Mixed
    },
    lucky_bonus: {
      type: Number,
      default: 0
    },
    is_vip: {
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
  UserSchema.index({ wework_userid: 1, corp: 1 }, { unique: true, partialFilterExpression: { wework_userid: { $exists: true } } })
  return mongoose.model('User', UserSchema, 'user')
}
