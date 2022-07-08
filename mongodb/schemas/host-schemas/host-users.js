const mongoose = require("mongoose");
const host_user = new mongoose.Schema({
    // hostDeviceId: {
    //     type: String,
    //     required: true,
    // },
    hostName:{
        type: String,
        required: true,
    },
    hostId: {
        type: String,
        required: true,
    },
    connectedAdmin:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"admin_users_schema"
    },
   
    isConnected: {
        type:String,
        required: true,
    } 
});

const host_users_schema = mongoose.model("host_users_schema", host_user);

module.exports = {host_users_schema};