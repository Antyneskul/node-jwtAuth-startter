const User = require('../models/user');
const config = require('../config');
const jwt = require('jwt-simple');

function tokenForUser(user) {
    const timestamp = new Date().getTime();
    return jwt.encode({sub: user.id, iat: timestamp}, config.secret);
}

exports.signin = (req, res, next) => {
    //User has already had their email and password auth'd
    //We just need to give them token
    res.send({token: tokenForUser(req.user)});
};

exports.signup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const validEmail = (email) => {
        const regExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return email && regExp.test(email);
    };

    const validPassword = (password) => {
        const regExp = /^[A-Za-z]\w{7,15}$/;
        return password && regExp.test(password);
    };

    if (!validEmail(email) || !validPassword(password)) {
        return res.status(422).send({
            success: false,
            message: 'You must provide valid email and password'
        });
    }

    //See if a user with the given email exists
    User.findOne({email})
        .then(user => {
            //If a user with email does exists, return an error
            if (user) {
                throw 'User already exists';
            }
            //If a user with email does NOT exist, create and save a record
            let userModel = new User({
                email,
                password
            });

            return userModel.save();
        })
        .then(user => {
            //Respond to request indicating the user was created
            res.send({
                success: true,
                message: `User with ${email}, was successfully created`,
                token: tokenForUser(user)
            });
        })
        .catch(err => {
            next(err);
            res
                .status(422)
                .send({
                    success: false,
                    message: err
                });
        });
};