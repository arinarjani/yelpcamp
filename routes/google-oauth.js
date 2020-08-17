const router = require('express').Router();
const passport = require('passport');
const User = require('../models/user');

// auth with google
router.get('/google', (req, res) => {
    // handle with passport
    res.send('logging in with google')
});

module.exports = router;