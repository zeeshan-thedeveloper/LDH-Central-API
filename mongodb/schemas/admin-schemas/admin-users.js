const mongoose = require("mongoose");
const admin_user = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
      },
    lastName: {
        type: String,
        required: true,
      },
    email: {
        type: String,
        required: true,
      },
    profilePhotoUrl:{
        type: String,
        required: true,
    },
    userUid:{
        type: String,
        required: true,
    },
    tokenId:{
        type: String,
        required: true,
    },
    accessToken:{
        type: String,
        required: true,
    },


});

const admin_user_schema = mongoose.model("admin_user_schema", admin_user);

module.exports = {admin_user_schema};