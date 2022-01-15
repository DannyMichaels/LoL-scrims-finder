const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Ban = new Schema(
  {
    _user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateFrom: {
      type: Date,
      default: null,
    },
    dateTo: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ban', Ban, 'bans');
