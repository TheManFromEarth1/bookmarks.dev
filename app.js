var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var routes = require('./routes/index');
var users = require('./routes/users');
var bookmarks = require('./routes/bookmarks');

var fs = require('fs-extra');
var rfs = require('rotating-file-stream');

var app = express();
mongoose.connect('mongodb://codingpedia:codingpedia@localhost:27017/codingpedia-bookmarks');

// sets port 3000 to default or unless otherwise specified in the environment
app.set('port', process.env.PORT || 3000);

//access logging setup
const logDirectory = (process.env.CONTAINER_HOME || '.') + '/log';
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// create a rotating write stream
let accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
})

app.use(logger('combined', {stream: accessLogStream}));// logs in file in Apache style format
app.use(logger('dev'));// logs at the console in 'dev' format

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//add CORS support
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Location');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization, Location');
  next();
});


app.use('/api', routes);
app.use('/api/private/users', users);
app.use('/api/public/bookmarks', bookmarks);
//app.use('/categories', categories);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
