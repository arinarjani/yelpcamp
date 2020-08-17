const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const methodOverride = require('method-override');
const flash = require('connect-flash');
require('dotenv').config();

// routes
const commentRoutes = require('./routes/comments');
const campgroundRoutes = require('./routes/campgrounds');
const indexRoutes = require('./routes/index');

// Models
const User = require('./models/user');

const app = express();
const port = process.env.PORT;
const mongodb_uri = process.env.MONGODB_URI;
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

// method override
app.use(methodOverride('_method'));

// connnet mongoose
mongoose.connect(mongodb_uri, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('mongodb is connected');
}); 

// ==========
// Configure Passport Middleware
// ==========
// have currentUser on all pages
app.use(require('express-session')({
    secret: 'eric sparrow',
    resave: false,
    saveUninitialized: false,
    // cookie: {secure: true},
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Configure passport-local to use User model for authentication
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// custom middleware
app.use((req, res, next) => {
    // give all files access to currentUser via res.locals
    res.locals.currentUser = req.user;
    console.log('app.js:63 - req.user', req.user);
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

// use routes
app.use(indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);

app.listen(port, () => {
    console.log('server started');
});