'use strict';
//do
const express = require('express');
const cors = require('cors');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser	= require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const mysql = require('mysql');

const config = require('./app/config/config');

const account	= require('./app/routes/account');
const vsers = require('./app/routes/vsers');
const cod = require('./app/routes/cod');

const app = express();

const corsOptions = {
  // origin: (origin, callback) => {
  //   var originIsWhitelisted = whitelist.indexOf(origin) !== -1
  //   callback(originIsWhitelisted ? null : 'Bad Request', originIsWhitelisted)
  // },
  'origin': true,
  'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
  'preflightContinue' : false
}
// pre-flight
app.options('*', cors(corsOptions))
app.use(cors(corsOptions))
app.disable('x-powered-by');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(passport.initialize());
// app.use(fileUpload());

mongoose.Promise = global.Promise;

/////////////////////////////////////////////////////
console.log('[ HHH ]');

/*
//connect to MongoDB
mongoose.connect(config.database); //, { useNewUrlParser: true }
var db = mongoose.connection;


//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('openUri', function (data) {
  // we're connected!
  console.log('connection successful');
  console.log(data);
});

//use sessions for tracking logins
app.use(session({
  secret: 'FFF',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}))
///////////////////////////////////////////////////////
*/

// view engine setup
app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/account', account);
app.use('/vsers', passport.authenticate('jwt', { session: false}), vsers);
app.use('/cod', cod);

const dir = path.join(__dirname, 'public');

app.use(express.static(dir));

// Handle 404
app.use(function(req, res, next) {
    if(req.accepts('html') && res.status(404)) {
        res.render('fire.ejs');
        return;
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
