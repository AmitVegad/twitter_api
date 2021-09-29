const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
require("dotenv").config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const tweetRouter = require('./routes/tweet');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tweet', tweetRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

mongoose.connect(process.env.Mongo_URL,{ useNewUrlParser: true})
const db = mongoose.connection;
db.on('open',()=>{
  console.log("Connected to the MongoDB database.");
})
db.on('error', (err) => {
  console.log(`Database error: ${err}`);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
