const async = require('async');
const bcrypt = require('bcrypt');
const { body, check, validatorResult } = require('express-validator');
const passport = require('passport');
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

exports.index = (req, res, next) => {
    Post.find({}).populate('user').exec((err, post_list) => {
        if (err)
            return next(err);
        res.send(post_list);
    });
}
