const mongoose = require('mongoose');

// connect database
mongoose.connect('mongodb://localhost:27017/flipkart',{ useNewUrlParser: true});

// user schema
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    isActive:{
        type: Boolean,
        default: true,
    },
    followers:{
        type:Array,
        default: [],
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    }
})

// model with schema
module.exports = mongoose.model("User", userSchema,"user");