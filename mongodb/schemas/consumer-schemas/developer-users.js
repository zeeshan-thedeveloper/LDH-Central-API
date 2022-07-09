const mongoose = require("mongoose");
const developer_user = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
      },
    lastName: {
        type: String,
        required: true,
      },
    email:{
        type: String,
        required: true,
        unique: true,
      },
    profilePhotoUrl:{
        type: String,
        required: true,
    },
    userUid:{
        type: String,
        required: true,
    },
    jwtToken:{
        type: String,
        required: true,
    },
    allowedHostAccessUrls:{
        type:Array,
        default:[]
    },
    googleAccountData:{
        type:Object,
        required: false,
    },
    githubAccountData:{
        type:Object,
        required: false,
    }
});

const developers_users_schema = mongoose.model("developers_users_schema", developer_user);

module.exports = {developers_users_schema};