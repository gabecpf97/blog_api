const Comment = require('../models/comment');

exports.post_comment_get = (req, res, next) => {
    Comment.find({post: req.params.id}).populate('post').populate('user')
    .exec((err, comment_list) => {
        if (err)
            return next(err);
        res.send({comment_list});
    })
}

exports.user_comment_get = (req, res, next) => {
    Comment.find({user: req.params.id}).populate('post').populate('user')
    .exec((err, comment_list) => {
        if (err)
            return next(err);
        res.send({comment_list});
    })
}