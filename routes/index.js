var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', isLoggedIn, function(req, res, next) {
  res.redirect('/secret');
});

// GET - Signup page
router.get('/signup', function(req, res, next) {
    res.render('signup');
});

// POST - Signup page
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/secret',
    failureRedirect: '/signup',
    failureFlash: true
}));

// GET - secret page
router.get('/secret', isLoggedIn, function(req, res, next) {
    res.render('secret', {username: req.user.local.username});
});

// GET - login page
router.get('/login', function(req, res, next) {
    res.render('login');
});

// POST - login page
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/secret',
    failureRedirect: '/login',
    failureFlash: true
}));

// GET - logout page
router.get('/logout', function(req, res, next) {
    // passport middleware adds logout function to req object
    req.logout();
    res.redirect('/');
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;
