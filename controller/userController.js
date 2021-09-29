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

//register
exports.register = async (req, res) => {
  const { username, password, password2 } = req.body;
  try {
    let errors = [];

    if (!username || !password || !password2) {
      errors.push({ message: "Please enter all fields" });
    }

    // validation password
    const validateError = schema.validate(password, { list: true });

    if (validateError.length > 0) {
      if (validateError.includes("min")) {
        errors.push({ message: "password must be at least 6 characters long" });
      }
      if (validateError.includes("max")) {
        errors.push({ message: "password must be max 16 characters long" });
      }
      if (validateError.includes("uppercase")) {
        errors.push({ message: "password must have uppercase characters" });
      }
      if (validateError.includes("lowercase")) {
        errors.push({ message: "password must have lowercase characters" });
      }
      if (validateError.includes("digits")) {
        errors.push({ message: "password must have at least 2 digits" });
      }
      if (validateError.includes("symbols")) {
        errors.push({ message: "password must have at least 1 synmbol" });
      }
      if (validateError.includes("spaces")) {
        errors.push({ message: "password does not contain spaces" });
      }
    }

    if (password != password2) {
      errors.push({ message: "Passwords do not match" });
    }

    if (errors.length > 0) {
      response.validationErrorWithData(res, errors, {
        username: username,
        password: password,
        password2: password2,
      });
    } else {
      //check username already exit or not
      let user = await User.findOne({ username: username });
      if(user){
        response.ErrorResponse(res, "Username already exists");
      }else{
        const newUser = new User({
          username,
          password,
        });

        // convert password in to crypted form
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
  }
  } catch (err) {
      response.ErrorResponse(res, err.message);
  }
  
};

// middleware: check for every req to user auth token is valid or not
exports.auth = (req, res, next) => {
  const { Authentication } = req.cookies;

  //verify every req token is valid or not
  jwt.verify(Authentication, process.env.TOKEN_KEY, function (err, decoded) {
    if (err) {
      response.unauthorizedResponse(res, "session expeired please login again");
    } else {
      req.body.userId = decoded.userId;
      next();
    }
  });
};

// login
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
      if (err) {
        response.ErrorResponse(res, err.message)
      }else{
        if (isMatch) {
          // Generating token of user is successfully authenicated
          const token = jwt.sign(
            { userId: user._id, username },
            process.env.TOKEN_KEY,
            {
              expiresIn: "3m",
            }
          );

          //send token with cookies
          res.cookie("Authentication", token);
          response.successResponse(res, "login successfully");
        } else {
          response.unauthorizedResponse(res, "Password incorrect");
        }
      }
    });
  });
};

// logout
exports.logout = (req, res) => {
  // on logout clear token
  res.clearCookie("Authentication");
  response.successResponse(res, "logout successfully");
};

// follow user
exports.follow = async (req, res) => {
  // userId: Which user try to follow someone----followedUser: to who following
  const { userId, followedUser } = req.body;
  try {
    let user = await User.findOne({ _id: followedUser });

    if(!user){
      response.ErrorResponse(res, "User not Found");
    }else{
      // add to followedUser followers list
      if (!user.followers.includes(userId)) {
        user.followers.push(userId);
        await user.save();
        let mainUser = await User.findOne({ _id: userId });

        // add to userId following list
        if (!mainUser.following.includes(followedUser)) {
          mainUser.following.push(followedUser);
          await mainUser.save();
          response.successResponse(
            res,
            "Successfully followed"
          );
        }

      }else{
        response.ErrorResponse(res, "User already followed")
      }
    }
  } catch (err) {
    response.ErrorResponse(res, err.message);
  }
};

//unfollow user
exports.unfollow = async (req, res) => {
  // userId: who want to unfollow----unFollowUserId: to who unfollow
  const { userId, unFollowUserId } = req.body;
  try{
    let user = await User.findOne({ _id: userId });
    if(!user){
      response.ErrorResponse(res, "user not found");
    }else{
      // remove user from userId following list 
      if (user.following.includes(unFollowUserId)) {
        user.following.splice(user.following.indexOf(unFollowUserId), 1);
        await user.save();

        let mainUser = await User.findOne({ _id: unFollowUserId });
        if(!mainUser){
          response.ErrorResponse(res, "user not found");
        }else{
          // remove user from unFollowUserId followers list
          if (mainUser.followers.includes(userId)) {
            mainUser.followers.splice(user.followers.indexOf(userId), 1);
            await mainUser.save();
            response.successResponse(
              res,
              "Successfully unfollowed"
            );
          }
        }
      }else{
        response.successResponse(
          res,
          "You are not following this user"
        );
      }
    }
  }catch(err){
      response.ErrorResponse(res, err.message)
  }
};
