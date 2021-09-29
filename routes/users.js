var express = require('express');
var router = express.Router();
const userController = require('../controller/userController')

// register new user
router.post('/register', userController.register);

// login user
router.post('/login', userController.login);

// logout
router.get('/logout', userController.logout);

// follow user
router.post('/follow',userController.auth, userController.follow);

// unfollow user
router.post('/unfollow',userController.auth, userController.unfollow);

module.exports = router;
