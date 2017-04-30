var LocalStrategy = require('passport-local');
var TwitterStrategy = require('passport-twitter');

var configAuth = require('./auth');

var User = require('../models/user');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        })
    });

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, username, password, done) {
        process.nextTick(function(){
            User.findOne({'local.username' : username}, function(err, user) {
                if (err) {return done(err);}
                if (user) {
                    return done(null, false, req.flash('signupMsg', 'This username is taken'));
                }
                var newUser = new User();
                newUser.local.username = username;
                newUser.local.password = newUser.generateHash(password);
                newUser.save(function(err) {
                    if (err) {return done(err);}
                    return done(null, newUser);
                })
            })
        })
    }));
    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, username, password, done) {
        process.nextTick(function() {
            User.findOne({'local.username':username}, function(err, user) {
                if (err) {return done(err);}
                if (!user) {
                    return done(null, false, req.flash('loginMsg', 'Username not found'));
                }
                if (!user.validPassword(password)) {
                    return done(null, false, req.flash('loginMsg', 'Password incorrect'));
                }
                return done(null, user);
            });
        });
    }));

    passport.use(new TwitterStrategy({
        consumerKey: configAuth.twitterAuth.consumerKey,
        consumerSecret: configAuth.twitterAuth.consumerSecret,
        callbackUrl: configAuth.twitterAuth.callbackUrl
    }, function(token, tokenSecret, profile, done) {
        process.nextTick(function() {
            User.findOne({ 'twitter.id': profile.id }, function(err, user) {
                if (err) {
                    return done(err);
                }
                // If found user with this ID
                if (user) {
                    return done(null, user);
                }
                // No user found, creating new one
                var newUser = new User();
                newUser.twitter.id = profile.id;
                newUser.twitter.token = token;
                newUser.twitter.username = profile.username;
                newUser.twitter.displayName = profile.displayName;

                newUser.save(function(err) {
                    if (err) {
                        return done(err);
                    }
                    return done(null, newUser);
                });
            });
        });
    }));
};