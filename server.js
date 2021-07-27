const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');

const app = express();
const apiRouter = require('./api/api');
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cors());
app.use('/api', apiRouter);
app.use(errorHandler());
app.use(morgan('dev'));

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
  });

module.exports = app;