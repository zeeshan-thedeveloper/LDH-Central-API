const mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');
const hostAccessUrlSchema=new mongoose.Schema({
    url:{
        type:String,
        required:true
    },
    numberOfHits:{
        type:Number,
        required:false
    },
    status:{
        type:Boolean,
        default:false
    }
})

const host_user = new mongoose.Schema({
    // hostDeviceId: {
    //     type: String,
    //     required: true,
    // },
    hostName:{
        type: String,
        required: true,
        unique:true
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
    hostAcessUrl:hostAccessUrlSchema,
    isConnected: {
        type:String,
        required: true,
    } 
});

host_user.plugin(uniqueValidator);
const host_users_schema = mongoose.model("host_users_schema", host_user);

module.exports = {host_users_schema};