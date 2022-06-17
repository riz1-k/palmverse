const User = require('../database/models/userModel');
const Booking = require('../database/models/bookingModel');
const axios = require('axios');

require('dotenv').config();

exports.newBooking = async (req, res) => {
  const { walletId, bookingInfo, transactionId, to, lamports } =
    req.body;

  let lamFromVeri;
  let info;

  let transactionExists = await Booking.findOne({
    transactionId,
  }).exec();

  const verifyPay = async () => {
    var data = JSON.stringify({
      method: 'getConfirmedTransaction',
      jsonrpc: '2.0',
      params: [
        transactionId,
        {
          encoding: 'jsonParsed',
          commitment: 'confirmed',
        },
      ],
      id: 'b4fac44f-e3d1-4fb8-8f85-91bae7d49447',
    });

    var config = {
      method: 'post',
      url: 'https://explorer-api.devnet.solana.com/',
      headers: {
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        Connection: 'keep-alive',
        DNT: '1',
        Origin: 'https://explorer.solana.com',
        Referer: 'https://explorer.solana.com/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36 Edg/102.0.1245.33',
        'content-type': 'application/json',
        'sec-ch-ua':
          '" Not A;Brand";v="99", "Chromium";v="102", "Microsoft Edge";v="102"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
      },
      data: data,
    };

    try {
      const response = await axios(config);
      info = await response.data.result.transaction.message
        .instructions[0].parsed.info;
      lamFromVeri = info.lamports;
      if (
        info.destination === to &&
        info.source === walletId &&
        info.lamports === lamports
      ) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (!walletId || !bookingInfo) {
    return res
      .status(401)
      .json({ msg: 'No walletId or Booking Details' });
  }

  if (transactionExists) {
    return res
      .status(403)
      .json({ msg: 'Duplicate Transaction found' });
  }

  User.findOne({ walletId })
    .select('bookings')
    .exec(async (err, user) => {
      if (err) {
        console.log(err);
      }
      if (user) {
        const a = await verifyPay();
        if (!a) {
          console.log('unverified');
          return res.status(400).json({
            msg: 'Unverified transaction',
            sent: lamports,
            info: info,
          });
        }
        const newBook = await Booking.create({
          ...bookingInfo,
          transactionId,
        });
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
