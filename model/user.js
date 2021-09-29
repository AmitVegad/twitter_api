const mongoose = require('mongoose');

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
    following:{
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