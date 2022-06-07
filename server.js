const express = require(`express`);
const path = require('path');
const cors = require(`cors`);
const morgan = require('morgan');
const { json } = require(`body-parser`);
const { mongo } = require('./server/database/connect');
const bodyparser = require('body-parser');
require('./server/database/models/userModel');
require('./server/database/models/bookingModel');

const app = express();
app.use(bodyparser.json());
app.use(cors());
app.use(morgan('dev'));
mongo();

app.use('/api', require('./server/routes/routes'));

app.listen(process.env.PORT || 4000, () =>
  console.log(
    '------------------------NODE server started on PORT 4000------------------------'
  )
);
