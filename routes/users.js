var express = require('express');
var router = express.Router();
const userController = require('../controller/userController')

/* GET users listing. */
router.post('/', function(req, res, next) {

  res.send(req.cookies);
    
});

// register new user
router.post('/register', userController.reg);

// login user
router.post('/login', userController.login);

// follow user
router.post('/follow',userController.auth, userController.follow);

// unfollow user
router.post('/unfollow',userController.auth, userController.unfollow);

module.exports = router;
