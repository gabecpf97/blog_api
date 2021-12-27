const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const auth = passport.authenticate('jwt', {session: false});

/* GET home page. */
router.get('/', postController.index);

// routes for user
router.post('/sign_up', userController.user_create);
router.post('/log_in', userController.user_log_in_post);
router.get('/user/:id', auth, userController.user_detail);
router.post('/user/:id/info', auth, userController.user_info_post);
router.post('/user/:id/password', auth, userController.user_password_post);
router.post('/user/:id/delete', userController.user_delete);

// routes for post
router.post('/post/create', auth, postController.post_create);
router.get('/post/:id', postController.post_detail);
router.post('/post/:id/update', auth, postController.post_update);
router.post('/post/:id/delete', auth, postController.post_delete);
router.post('/post/:id/comment/create', auth, postController.post_comment_post);
router.post('/post/:id/comment/:c_id/update', auth, postController.post_comment_update);
router.post('/post/:id/comment/:c_id/delete', auth, postController.post_comment_delete);

router.get('/post_comment/:id', commentController.post_comment_get);
router.get('/user_comment/:id', auth, commentController.user_comment_get);

module.exports = router;
