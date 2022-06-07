const mongoose = require('mongoose');
require('dotenv').config();
//DB config
const db = process.env.MONGO_URI;

exports.mongo = () => {
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() =>
      console.log(
        '---------------------------------DB Connected-----------------------------------'
      )
    )
    .catch((err) => console.log(err.message));
};
