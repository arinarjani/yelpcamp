const router = require('express').Router();
const passport = require('passport');
const User = require('../models/user');

// root route
router.get('/', (req, res) => {
    res.render('landing');
});

// show register form
router.get('/register', (req, res) => {
    res.render('register');
});

// handle sign up logic
router.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.register(new User({username: username}), password, (err, user) => {
        if (err) {
            console.log('there was an error registering', err);
            req.flash('error', err.message); 
            return res.redirect('/register');
            // OR
            // delete line 22, edit line 23 with return res.render('register', {error: err.message});
        }
        // TODO: find out what this next line does, because with/without it, passport generates
        //       an error of 'A user with the given username is already registered'
        // TODO COMPLETED: lines 165 and 167 log the user in once the account it created
        //                 comment them out if you want your user to click the login button
        passport.authenticate('local')(req, res, () => {
            req.flash('success', `Welcome To YelpCamp ${user.username}`);
            res.redirect('/');
        });
    });
});

// show login form
router.get('/login', (req, res) => {
    res.render('login');
});

// handle login logic
router.post('/login', passport.authenticate('local', {
    successRedirect: '/campgrounds', 
    failureRedirect: '/register',
    // failureFlash: true,
}));

// logout logic 
router.get('/logout', (req, res) => {
    // console.log('./routes/index.js:182 - are you logged in?', req.isAuthenticated());
    req.logout();
    req.flash('success', 'you successfully logged out');
    res.redirect('/campgrounds');
    // console.log('./routes/index.js:185 - are you logged in?', req.isAuthenticated());
});

module.exports = router;