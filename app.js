const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJwt = require('passport-jwt');
const JWTStrategy = passportJwt.Strategy;
const ExtractJWT = passportJwt.ExtractJwt;
const compression = require('compression');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/user');
const indexRouter = require('./routes/index');

// passport setup
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  (email, password, done) => {
  console.log(email);
  User.findOne({email}, (err, user) => {
    if (err)
      return done(err);
    if (!user)
      return done(null, false, {message: 'Email not found'});
    bcrypt.compare(password, user.password, (err, res) => {
      if (err)
        return next(err);
      if (!res)
        return done(null, false, {message: 'Password incorrect'});
      return done(null, user, 'Loged in');
    });
  });
}));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret_key',
  },
  function(jwtPayload, cb) {
    return User.findById(jwtPayload.id).exec((err, theUser) => {
      if (err)
        return cb(err);
      return cb(null, theUser);
    });
  }
));

const app = express();

// mongodb setup
const mongoose = require('mongoose');
const mongoDB = `mongodb+srv://admin:${process.env.DB_PASSWORD}@cluster0.cbzz8.mongodb.net/myBlog?retryWrites=true&w=majority`;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(passport.initialize());
app.use(compression());
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
