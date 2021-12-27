const async = require('async');
const bcrypt = require('bcrypt');
const { body, check, validationResult } = require('express-validator');
const passport = require('passport');
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

exports.index = (req, res, next) => {
    Post.find({}).populate('user').sort({date: -1}).exec((err, post_list) => {
        if (err)
            return next(err);
        res.send({post_list});
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
                res.send({post});
            });
        }
    }
]

exports.post_update = [
    body('title', "Title must not be empty").trim().isLength({min: 1}).escape(),
    body('message', "Message must not be empty").trim().isLength({min: 1}).escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        const post = new Post({
            title: req.body.title,
            message: req.body.message,
            user: req.user,
            _id: req.params.id,
        });
        if (!errors.isEmpty()) {
            res.send({errors: errors.array()});
        } else {
            Post.findById(req.params.id).exec((err, thePost) => {
                if (err)
                    return next(err);
                if (thePost === null)
                    res.send({errors: 'No such post'});
                else {
                    post.comment_cnt = thePost.comment_cnt;
                    post.date = thePost.date;
                    Post.findByIdAndUpdate(req.params.id, post, {}, (err, newPost) => {
                        if (err)
                            return next(err);
                        res.send({post});
                    });
                }    
            });
        }
    }
]

exports.post_delete = (req, res, next) => {
    Post.findById(req.params.id).exec((err, thePost) => {
        if (err)
            return next(err);
        if (thePost === null)
            res.send({errors: 'No such post'});
        else {
            Post.findByIdAndRemove(req.params.id, err => {
                if (err)
                    return next(err);
                res.send({message: 'deleted'});
            })
        }
    })
}

exports.post_comment_post = [
    body('message', "Comment must not be empty").trim().isLength({min: 1}).escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.send({errors: errors.array()});
        } else {
            const comment = new Comment({
                post: req.params.id,
                user: req.user,
                message: req.body.message,
                date: new Date,
            });
            comment.save(err => {
                if (err)
                    return next(err);
                res.send({comment})
            })
        }
    }
]

exports.post_comment_update = [
    body('message', "Comment must not be empty").trim().isLength({min: 1}).escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.send({errors: errors.array()});
        } else {
            Comment.findById(req.params.c_id).exec((err, theComment) => {
                if (err)
                    return next(err);
                if (theComment === null) {
                    res.send({errors: 'No such comment'});
                } else {
                    const comment = new Comment({
                        post: req.params.id,
                        user: req.user,
                        message: req.body.message,
                        date: theComment.date,
                        _id: req.params.c_id
                    });
                    Comment.findByIdAndUpdate(req.params.c_id, comment, {}, (err, newComment) => {
                        if (err)
                            return next(err);
                        res.send({comment});
                    });
                }
            });
        }
    }
]

exports.post_comment_delete = (req, res, next) => {
    Comment.findById(req.params.c_id).exec((err, theComment) => {
        if (err)
            return next(err);
        if (theComment === null) {
            res.send({errors: 'No such comment'});
        } else {
            Comment.findByIdAndRemove(req.params.c_id, err=> {
                if (err)
                    return next(err);
                res.send({message: 'deleted'});
            })
        }
    })
}