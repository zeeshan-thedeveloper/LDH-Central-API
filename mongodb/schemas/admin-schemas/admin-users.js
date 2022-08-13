const mongoose = require("mongoose");

const connectedHostSchema= new mongoose.Schema({
    hostId : {
        type:String,
        required: true,
      
    }
})

const admin_user = new mongoose.Schema({
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
    connectedHostList:[connectedHostSchema],
    googleAccountData:{
        type:Object,
        required: false,
    },
    githubAccountData:{
        type:Object,
        required: false,
    },
    apiKey:{
        type:String,
        required:false,
        default:"Generate an api key"
    },
    authType:{
        type:String,
        required:false
    }
});

const admin_users_schema = mongoose.model("admin_users_schema", admin_user);

module.exports = {admin_users_schema};