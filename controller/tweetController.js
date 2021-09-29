const User = require("../model/user");
const Tweet = require("../model/tweet");

const response = require("../helper/response");
var multer = require("multer");

require("dotenv").config();

// middleware to store image (image will store in public/images/)
const storeg = multer.diskStorage({
  destination: "./public/images/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + file.originalname);
  },
});

exports.upload = multer({
  storage: storeg,
}).single("image");

// craete new tweet
exports.create = async (req, res) => {
  const { userId, description } = req.body;
  const image = req.file.filename;
  console.log(userId);
  try {
    if (!description && !image) {
      response.ErrorResponse(res, "Please provide a description or image");
    }else{
      console.log(userId);
      const tweet = new Tweet({
        userId: userId,
        description,
        image,
      });
      await tweet.save()
      response.successResponseWithData(
        res,
        "tweeted successfully",
        tweet
      );
    }
  } catch (err) {
      response.ErrorResponse(res, err.message);
  }
};

//delete tweet
exports.delete = async (req, res) => {
  const { tweetId } = req.params;
  try {
      let tweetData = await Tweet.findByIdAndDelete(tweetId);
      response.successResponseWithData(res, "deleted successfully", tweetData);
  } catch (err) {
      response.ErrorResponse(res, err.message);
  }
};

// get single tweet
exports.read = async (req, res) => {
  const { tweetId } = req.params;
  try {
    let tweet = await Tweet.findOne({ _id: tweetId });
    if(!tweet){
      response.ErrorResponse(res, "tweet not found");
    }else{
      response.successResponseWithData(
        res,
        "fetched tweet successfully",
        tweet
      );
    }
  } catch (err) {
    response.ErrorResponse(res, err.message)
  }
  
};

// get all tweets
exports.allTweets = async (req, res) => {

  try {
      let tweets = await Tweet.find({}).sort({ createdAt: -1 });
      if(!tweets){
        response.ErrorResponse(res, "something want wrong")
      }else{
        response.successResponseWithData(res, "fetched tweet successfully", tweets);
      }
  } catch (err) {
    response.ErrorResponse(res, error.message)
  }
};

// likes tweet
exports.like = async (req, res) => {
  const { tweetId, userId } = req.body;

  try {
      let tweet = await Tweet.findOne({ _id: tweetId });
      if(!tweet){
        response.ErrorResponse(res, "tweet not found");
      }else{
        if (!tweet.likes.includes(userId)) {
          tweet.likeCount++;
          tweet.likes.push(userId);
          let likedtweet = await tweet.save();
          response.successResponseWithData(
            res,
            "liked successfully",
            likedtweet
          );
        }else{
          response.successResponse(res, "Already liked tweet")
        }
      }
  } catch (err) {
      response.ErrorResponse(res, err.message);
  }
};

// unlike tweet
exports.unlike = async (req, res) => {
  const { tweetId, userId } = req.body;

  try {
    let tweet  = await Tweet.findOne({ _id: tweetId });
    if(!tweet){
      response.ErrorResponse(res, "tweet not found");
    }else{
      if (tweet.likes.includes(userId)) {
        tweet.likeCount--;
        tweet.likes.splice(tweet.likes.indexOf(userId), 1);
        let unlikedTweet = await tweet.save();
        response.successResponseWithData(
          res,
          "unliked successfully",
          unlikedTweet
        );
      }else{
        res.successResponse(res, "Already unliked");
      }
    }
  } catch (err) {
    response.ErrorResponse(res, err.message);
  }
};
