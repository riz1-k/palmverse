const { Schema, model } = require('mongoose');

const UserModel = new Schema({
  created_at: {
    type: Date,
    default: Date.now,
  },
  walletId: {
    type: String,
    required: true,
  },
  bookings: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
  ],
});

module.exports = model('User', UserModel);
