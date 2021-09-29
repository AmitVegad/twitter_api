var express = require('express');
var router = express.Router();
const tweetController = require('../controller/tweetController');
const userController = require('../controller/userController');

// create tweet
router.post('/create',userController.auth, tweetController.upload, tweetController.create);

// get single tweet
router.post('/read' ,userController.auth, tweetController.read);

// delete tweet
router.post('/delete', userController.auth, tweetController.delete);

// get all tweets
router.get('/alltweets', userController.auth, tweetController.allTweets);

// like tweet
router.post('/like', userController.auth, tweetController.like);

// unlike tweet
router.post('/unlike', userController.auth, tweetController.unlike);



module.exports = router;
