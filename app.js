var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var session = require('express-session');
var bodyParser = require('body-parser');
require('handlebars/runtime');


//Connect to the database
var mongoose = require("mongoose");
mongoose.connect(process.env.MONGOLAB_URI  || 'mongodb://localhost/mymongodb');

// Import route handlers
var index = require('./routes/index');
var user_auth = require('./routes/user_auth');
//var users = require('./routes/users');
var tweets = require('./routes/tweets');
var follows = require('./routes/follows');
//var retweets = require('./routes/retweets');

// Import User model
// var data = require('./models/User');
var UserAuth = require("./models/user_auth");

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret : '6170', resave : true, saveUninitialized : true }));
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware. This function
// is called on _every_ request and populates
// the req.currentUser field with the logged-in
// user object based off the username provided
// in the session variable (accessed by the
// encrypted cookied).
var findByUsername = function (username, callback) {
  UserAuth.find({username:username}, function(err,results){
    if(results.length>0){
      callback(null,results[0]);
    } else {
    callback({ msg : 'No such user!' });
    }
  });
};

app.use(function(req, res, next) {
  if (req.session.username) {
    findByUsername(req.session.username, 
      function(err, user) {
        if (user) {
          req.currentUser = user;
        } else {
          req.session.destroy();
        }
        next();
      });
  } else {
      next();
  }
});

// Map paths to imported route handlers
app.use('/', index);
app.use('/users', user_auth);
app.use('/tweets', tweets);
app.use('/follows',follows);


// ERROR HANDLERS
// Note: The methods below are called
// only if none of the above routes 
// match the requested pathname.

// Catch 404 and forward to error handler.
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Development error handler.
// Will print stacktraces.
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// Production error handler.
// No stacktraces leaked to user.
app.use(function(err, req, res, next) {
  res.status(err.status || 500).end();
});

module.exports = app;
