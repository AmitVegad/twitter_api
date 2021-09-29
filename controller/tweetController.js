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
exports.create = (req, res) => {
  const { userId, description } = req.body;
  const image = req.file.filename;

  // validate tweet
  if(!description && !image) {
      response.ErrorResponse(res, "Please provide a description or image");
  }

  User.findOne({ _id: userId }).then((user) => {
    if (!user) {
      response.ErrorResponse(res, "User not found");
    } else {
      const tweet = new Tweet({
        userId,
        description,
        image,
      });

      tweet.save((err, tweetData) => {
        if (err) {
          response.ErrorResponse(res, "something went wrong");
        } else {
          response.successResponseWithData(
            res,
            "tweeted successfully",
            tweetData
          );
        }
      });
    }
  });
};

//delete tweet
exports.delete = (req, res) => {
  const { tweetId } = req.body;

  Tweet.findByIdAndDelete(tweetId, (err, tweetData) => {
    if (err) {
      response.ErrorResponse(res, "Something went wrong");
    }
    response.successResponseWithData(res, "deleted successfully", tweetData);
  });
};

// get single tweet
exports.read = (req, res) => {
  const { tweetId } = req.body;

  Tweet.findOne({ _id: tweetId }, (err, tweetData) => {
    if (err) {
      response.ErrorResponse(res, "something went wrong");
    }
    response.successResponseWithData(
      res,
      "fetched tweet successfully",
      tweetData
    );
  });
};

// get all tweets
exports.allTweets = (req, res) => {
  Tweet.find({}, (err, tweets) => {
    if (err) response.ErrorResponse(res, "something went wrong");
    response.successResponseWithData(res, "fetched tweet successfully", tweets);
  })
    .sort({ createdAt: -1 })
    .limit(10);
};

// likes tweet
exports.like = (req, res) => {
    
  const { tweetId, userId } = req.body;

  Tweet.findOne({ _id: tweetId }, (err, tweet) => {
    if (err) {
      response.ErrorResponse(res, "something went wrong");
    }
    tweet.likeCount++;
    tweet.likes.push(userId);

    tweet.save((error, tweetData) => {
      if (error) {
        response.ErrorResponse(res, "something went wrong");
      }
      response.successResponseWithData(res, "liked successfully", tweetData);
    });
  });
};

// unlike tweet
exports.unlike = (req, res) => {
  const { tweetId, userId } = req.body;

  Tweet.findOne({ _id: tweetId }, (err, tweet) => {
    if (err) {
      response.ErrorResponse(res, "something went wrong");
    }
    tweet.likeCount--;
    tweet.likes.splice(tweet.likes.indexOf(userId), 1);

    tweet.save((error, tweetData) => {
      if (error) {
        response.ErrorResponse(res, "something went wrong");
      }
      response.successResponseWithData(res, "unliked successfully", tweetData);
    });
  });
};

