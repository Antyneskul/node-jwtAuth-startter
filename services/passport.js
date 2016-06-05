const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

//Setup Options for JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
};

const localOptions = {usernameField: 'email'};
//Create local Strategy
const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
    //Verify this username and password and call done with user
    //if it is the correct username and password
    //otherwise call done with false
    User
        .findOne({email})
        .then(user => {
            if (!user) {
                return done(null, false);
            }
            //compare passwords - is 'password' equal to user.password?
            user.comparePassword(password, (err, isMatch) => {
                if (err) {
                    return done(err);
                }

                if (!isMatch) {
                    return done(null, false);
                }

                return done(null, user);
            });
        })
        .catch(err => {
            return done(err, false);
        })


});

//Create JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
    // See if the user ID  in payload exists in our database
    //If it does, call 'done' with that
    //Otherwise, call done without a user object
    User.findById(payload.sub)
        .then((user) => {
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        })
        .catch(err => {
            return done(err, false);
        })
});

//Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);