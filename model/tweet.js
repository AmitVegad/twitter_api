const mongoose = require('mongoose');

// connect database
mongoose.connect('mongodb://localhost:27017/flipkart',{ useNewUrlParser: true});

// tweer schema
const tweetSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    likeCount:{
        type: Number,
        default:0,
    },
    likes:{
        type: Array,
        default: [],
    },
    image:{
        type:String,
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    },
})

// model and pass schema
module.exports = mongoose.model("Tweet", tweetSchema,"tweet");