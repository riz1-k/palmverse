const User = require('../database/models/userModel');
const Booking = require('../database/models/bookingModel');
require('dotenv').config();

exports.newBooking = async (req, res) => {
  const { walletId, bookingInfo } = req.body;

  if (!walletId || !bookingInfo) {
    return res
      .status(400)
      .json({ msg: 'No walletId or Booking Details' });
  }

  User.findOne({ walletId })
    .select('bookings')
    .exec(async (err, user) => {
      if (err) {
        console.error(err);
      }
      if (user) {
        const newBook = await Booking.create(bookingInfo);
        const savedBooking = await newBook.save();
        user.bookings.push(savedBooking);
        user.save();
        return res.status(200).json({
          msg: 'New booking created',
          userWallet: walletId,
          bookingInfo: savedBooking,
        });
      } else {
        return res
          .status(404)
          .json({ msg: 'User with the wallet ID not found' });
      }
    });
};
