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

// GET - secret page    (isLoggedIn is some kind of middleware)
router.get('/secret', isLoggedIn, function(req, res, next) {
    res.render('secret', {username: req.user.local.username,
        signupDate: req.user.signupDate,
        favorites: req.user.favorites});
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

router.post('/saveSecrets', isLoggedIn, function(req, res, next) {
    // Check if user provided any new data.
    if (!req.body.color && !req.body.luckyNumber) {
        req.flash('updateMsg', 'Please enter some new data');
        return res.redirect('/secret')
    }
    // Collect updated data from req.body and add to req.user
    if (req.body.color) {
        req.user.favorites.color = req.body.color;
    }
    if (req.body.luckyNumber) {
        req.user.favorites.luckyNumber = req.body.luckyNumber;
    }

    // Save modified user with new data
    req.user.save(function(err) {
        if (err) {
            if (err.name == 'ValidationError') {
                req.flash('updateMsg', 'Error updating, check your data is valid');
            }
            else {
                return next(err);
            }
        }
        else {
            req.flash('updateMsg', 'Updated data');
        }

        // Will have updated data upon redirect
        return res.redirect('/secret');
    })
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;
