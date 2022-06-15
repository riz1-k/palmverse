const { Schema, model } = require('mongoose');

const BookingModel = new Schema({
  created_at: {
    type: Date,
    default: Date.now,
  },
  dateIn: {
    type: Date,
    required: true,
  },
  dateOut: {
    type: Date,
    required: true,
  },
  hotelName: {
    type: String,
    required: true,
  },
  hotelCity: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

module.exports = model('Booking', BookingModel);
