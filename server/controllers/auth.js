const User = require('../database/models/userModel');
require('dotenv').config();
const jwt = require('jsonwebtoken');

exports.auth = (req, res) => {
  const { walletId } = req.body;
  console.log(walletId);
  if (!walletId) {
    return res.status(400).json({ msg: 'No wallet ID' });
  }

  User.findOne({ walletId }).then((user) => {
    if (!user) {
      const newUser = new User({ walletId });
      newUser.save().then((user) => {
        jwt.sign(
          {
            id: user.id,
          },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: 3600,
          },
          (err, token) => {
            if (err) throw err;
            return res.status(200).json({
              msg: 'New user',
              token,
              user: {
                id: user.id,
                walletId: user.walletId,
              },
            });
          }
        );
      });
    } else {
      User.findById(user.id)
        .select('-password')
        .populate('bookings')
        .exec((err, wallet) => {
          if (err) {
            console.log(err);
          }
          jwt.sign(
            {
              id: wallet.id,
            },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: 3600,
            },
            (err, token) => {
              if (err) throw err;
              return res.status(200).json({
                msg: 'User Logged In',
                token,
                user: wallet,
              });
            }
          );
        });
    }
  });
};

exports.tokenVerify = (req, res) => {
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.status(401).json({ msg: 'No token, Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = decoded;
    console.log(decoded);
    User.findById(user.id)
      .select('-password')
      .then((x) => {
        return res.status(200).json(x);
      });
  } catch (e) {
    console.log(e);
    res.status(400).json({ msg: 'Token Expired' });
  }
};
