const mongoose = require("mongoose");
const host_user = new mongoose.Schema({
    // hostDeviceId: {
    //     type: String,
    //     required: true,
    // },
    hostId: {
        type: String,
        required: true,
    },
    connectedAdmin:{
        type:String,
        required: true,
    },
   
    isConnected: {
        type:Boolean,
        default:false,
    } 
});

const host_users_schema = mongoose.model("host_users_schema", host_user);

module.exports = {host_users_schema};