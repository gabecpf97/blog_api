const async = require('async');
const bcrypt = require('bcrypt');
const { body, check, validationResult } = require('express-validator');
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

exports.post_detail = (req, res, next) => {
    Post.findById(req.params.id).populate('user')
    .exec((err, thePost) => {
        if (err)
            return next(err);
        if (thePost === null) {
            res.send({message: 'No such post'});
        } else {
            res.send({thePost});
        }
    });
}

exports.post_create = [
    body('title', "Title must not be empty").trim().isLength({min: 1}).escape(),
    body('message', "Message must not be empty").trim().isLength({min: 1}).escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        const post = new Post({
            title: req.body.title,
            message: req.body.message,
            user: req.user,
            date: new Date,
            comment_cnt: 0,
        });
        if (!errors.isEmpty()) {
            res.send({errors: errors.array()});
        } else {
            post.save(err => {
                if (err)
                    return next(err);
                res.send(post);
            });
        }
    }
]