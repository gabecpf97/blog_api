const async = require('async');
const bcrypt = require('bcrypt');
const { body, check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

exports.user_create = [
    body('username', 'Username have to be longer than 4 letter')
        .trim().isLength({min: 4}).escape(),
    check('username').custom(async (value) => {
        return new Promise((resolve, reject) => {
            User.findOne({username: value}).exec((err, theUser) => {
                (theUser === null) ? resolve(true) : reject(new Error('username already exists'));
            });
        })
    }),
    check('email', 'Please enter an email address').custom(value => {
        return value.indexOf("@") > -1 && value.indexOf("@") < value.length;
    }),
    body('password', 'Password have to be longer than 6 letter')
        .trim().isLength({min: 1}).escape(),
    check('confirm_password', 'Please enter the same password')
    .custom((value, { req }) => {
        return value === req.body.password;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
        });
        if (!errors.isEmpty()) {
            res.send({
                errors: errors.array(),
            })
        } else {
            bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
                if (err)
                    return next(err);
                user.password = hashedPassword;
                user.save(err => {
                    if (err)
                        return next(err);
                    res.send({ user: user });
                }) 
            });
        }
    }
]

exports.user_log_in_post = async (req, res, next) => {
    passport.authenticate('local', {session: false}, (err, theUser, info) => {
        console.log(theUser);
        if (err || !theUser) {
            return res.status(404).json({
                message: info.message
            });
        }
        req.login(theUser, {session: false}, (err) => {
            if (err)
                res.send(err);
            const token = jwt.sign({theUser}, 'secret_key');
            return res.json({token});
        });
    })(req, res, next);
}