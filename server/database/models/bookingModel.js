const { Schema, model } = require('mongoose');

const BookingModel = new Schema({
  created_at: {
    type: Date,
    default: Date.now,
  },
  dateIn: Date,
  dateOut: Date,
  hotelName: String,
  hotelCity: String,
  price: Number,
});

module.exports = model('Booking', BookingModel);
