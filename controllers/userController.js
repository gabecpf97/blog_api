const bcrypt = require('bcrypt');
const { body, check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/user');

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
    check('email').custom(async (value) => {
        return new Promise((resolve, reject) => {
            User.findOne({email: value}).exec((err, theUser) => {
                (theUser === null) ? resolve(true) : reject(new Error('Email already exists'));
            });
        });
    }),
    body('password', 'Password have to be longer than 6 letter')
        .trim().isLength({min: 1}).escape(),
    check('confirm_password', 'Please enter the same password')
    .custom((value, { req }) => {
        return value === req.body.password;
    }),
    (req, res, next) => {
        console.log(req);
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
                    const token = jwt.sign({user}, 'sercet_key');
                    res.send({token});
                }) 
            });
        }
    }
]

exports.user_log_in_post = async (req, res, next) => {
    passport.authenticate('local', {session: false}, (err, theUser, info) => {
        if (err || !theUser) {
            return res.json({
                message: info.message
            });
        }
        req.login(theUser, {session: false}, (err) => {
            if (err)
                res.send(err);
            const token = jwt.sign({theUser}, 'secret_key');
            return res.json(token);
        });
    })(req, res, next);
}

exports.user_detail = (req, res, next) => {
    res.send({
        user: req.user
    });
}

exports.user_info_post = [
    body('username', 'Username must be longer than 4 letter')
        .trim().isLength({ min: 4 }).escape(),
    check('username').custom(async (value) => {
        return new Promise((resolve, reject) => {
            User.findOne({ username: value }).exec((err, theUser) => {
                if (err)
                    return reject('Server error');
                if (theUser !== null)
                    return reject('Username already exists');
                else
                    return resolve(true);
            });
        });
    }),
    check('email', 'Please enter a valid email address')
        .custom(value => {return value.indexOf('@') > -1} ),
    (req, res, next) => {
        User.findById(req.params.id).exec((err, theUser) => {
            if (err)
            return next(err);
            if (theUser === null)
                res.send({ error: 'No such user' });
            else {
                const user = new User({
                    username: req.body.username,
                    email: req.body.email,
                    _id: theUser.id
                });
                const errors = validationResult(req);
                if (!error.isEmpty()) {
                    res.send({errors: errors.array()});
                    return;
                } else {
                    user.password = theUser.password;
                    User.findByIdAndUpdate(theUser.id, user, {}, (err, newUser) => {
                        if (err)
                            return next(err);
                        res.send({user});
                    })
                }
            }
        });
    }
]

exports.user_password_post = [
    check('password').custom(async (value, { req }) => {
        return new Promise((resolve, reject) => {
            User.findById(req.params.id).exec((err, theUser) => {
                if (err)
                    return reject("server error");
                bcrypt.compare(value, theUser.password, (err, res) => {
                    if (res)
                        return resolve(true);
                    else  
                        return reject("Wrong password");
                })
            });
        });
    }),
    body('new_password', 'Password must be longer than 6 letter').trim().isLength({min: 1}).escape(),
    check('confirm_new_password', 'Please enter the same password')
        .custom((value, {req}) => {return value === req.new_password}),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.send({errors: errors.array()});
        } else {
            User.findById(req.params.id).exec((err, theUser) => {
                if (err)
                    return next(err);
                if (theUser === null) {
                    res.send({errors: 'No such user'});
                } else {
                    const user = new User({
                        username: theUser.username,
                        email: theUser.email,
                        _id: theUser.id,
                    });
                    bcrypt.hash(req.body.new_password, 10, (err, hashedPassword) => {
                        if (err)
                            return next(err);
                        user.password = hashedPassword;
                        User.findByIdAndUpdate(user.id, user, {}, (err, newUser) => {
                            if (err)
                                return next(err);
                            res.send({user});
                        });
                    });
                }
            });
        }
    }
]

exports.user_delete = [
    check('password').custom(async (value, { req }) => {
        return new Promise((resolve, reject) => {
            User.findById(req.params.id).exec((err, theUser) => {
                if (err)
                    return reject("server error");
                bcrypt.compare(value, theUser.password, (err, res) => {
                    if (res)
                        return resolve(true);
                    else  
                        return reject("Wrong password");
                })
            });
        });
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.send({errors: errors.array()});
        } else {
            User.findById(req.params.id).exec((err, theUser) => {
                if (err)
                    return next(err);
                if (theUser === null) {
                    res.send({errors: "No such user"});
                } else {
                    User.findByIdAndRemove(req.params.id, (err) => {
                        if (err)
                            return next(err);
                        res.send({message: 'User deleted'});
                    });
                }
            })
        }
    }
]