const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const response = require("../helper/response");
var passwordValidator = require("password-validator");
require("dotenv").config();

var schema = new passwordValidator();

schema
  .is()
  .min(6) // Minimum length 6
  .is()
  .max(16) // Maximum length 16
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(2) // Must have at least 1 Symbol
  .has()
  .symbols(1) // Must have at least 2 digits
  .has()
  .not()
  .spaces(); // Should not have spaces

exports.reg = (req, res) => {
  const { username, password, password2 } = req.body;

  let errors = [];

  if (!username || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  // validation password
  const validateError = schema.validate(password, { list: true });

  if (validateError.length > 0) {
    if (validateError.includes("min")) {
      errors.push({ msg: "password must be at least 6 characters long" });
    }
    if (validateError.includes("max")) {
      errors.push({ msg: "password must be max 16 characters long" });
    }
    if (validateError.includes("uppercase")) {
      errors.push({ msg: "password must have uppercase characters" });
    }
    if (validateError.includes("lowercase")) {
      errors.push({ msg: "password must have lowercase characters" });
    }
    if (validateError.includes("digits")) {
      errors.push({ msg: "password must have at least 2 digits" });
    }
    if (validateError.includes("symbols")) {
      errors.push({ msg: "password must have at least 1 synmbol" });
    }
    if (validateError.includes("spaces")) {
      errors.push({ msg: "password does not contain spaces" });
    }
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (errors.length > 0) {
    response.validationErrorWithData(res, errors, {
      username: username,
      password: password,
      password2: password2,
    });
  } else {

    //check username already exit or not
    User.findOne({ username: username }).then((user) => {
      if (user) {
        response.ErrorResponse(res, "Username already exists");
      } else {
        const newUser = new User({
          username,
          password,
        });

        //convert original form of password to crypted 
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                response.successResponseWithData(
                  res,
                  "Registered successfully",
                  user
                );
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
};

// middleware: check for every req to user auth token is valid or not
exports.auth = (req, res, next) => {
  const { Authentication } = req.cookies;

  //verify every req token is valid or not
  jwt.verify(Authentication, process.env.TOKEN_KEY, function (err, decoded) {
    if (err) {
      res.send({ msg: "session expeired please login again" });
    } else {
      req.body.userId = decoded.userId;
      next();
    }
  });
};

exports.login = (req, res) => {
  let { username, password } = req.body;

  // check username registered or not
  User.findOne({
    username: username,
  }).then((user) => {
    if (!user) {
      response.unauthorizedResponse(res, "username not registered");
    }

    // Match password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {

        // Generating token of user is successfully authenicated
        const token = jwt.sign(
          { userId: user._id, username },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2m",
          }
        );
        res.cookie("Authentication", token);
        response.successResponse(res, "login successfully");
      } else {
        response.unauthorizedResponse(res, "Password incorrect");
      }
    });
  });
};

exports.logout = (req, res) => {

  // on logout clear token 
  res.clearCookie("Authentication");
  response.successResponse(res, "logout successfully");
};

exports.follow = (req, res) => {

  // userId: Which user you want to follow----byFollowUserId: who will perform action
  const { userId, byFollowUserId } = req.body;

  User.findOne({ _id: userId }).then((user) => {
    if (!user) {
      response.ErrorResponse(res, "something wrong");
    }

    // check user already follow or not
    if (!user.followers.includes(byFollowUserId)) {
      user.followers.push(byFollowUserId);
      user.save().then((user) => {
        response.successResponseWithData(res, "Successfully followed", user);
      });
    }
    response.successResponseWithData(res, "Successfully followed", user);
  });
};

exports.unfollow = (req, res) => {

  // userId: Which user you want to unfollow----byFollowUserId: who will perform action
  const { userId, byunFollowUserId } = req.body;

  User.findOne({ _id: userId }).then((user) => {
    if (!user) {
      response.ErrorResponse(res, "something wrong");
    }

    // cheeck user followed or not
    if (user.followers.includes(byunFollowUserId)) {
      user.followers.splice(user.followers.indexOf(byunFollowUserId), 1);
      user.save().then((user) => {
        response.successResponseWithData(res, "Successfully unfollowed", user);
      });
    }
    response.successResponseWithData(res, "Successfully unfollowed", user);
  });
};
