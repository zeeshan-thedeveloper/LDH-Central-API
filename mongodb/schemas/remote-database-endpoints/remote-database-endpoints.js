const mongoose = require("mongoose");
const host_user = new mongoose.Schema({
    urlId:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    hostUrl:{
        type:String,
        required:true
    },
    urlDescription:{
        type:String,
        required:true
    },
    urlQuery:{
        type:String,
        required:true
    },
    urlDatabaseName:{
        type:String,
        required:true
    },
    sourceHostId:{
        type: String,
        required: true,
    },
    sourceHostName:{
        type:String,
        required:true,
    },
    ownerAdminId: {
        type: String,
        required: true,
    },
    endPointUrlAddress:{
        type:String,
        required: true,
    },
    isEnabled: {
        type:String,
        required: false,
        default:false
    },
    isPublic: {
        type:Boolean,
        required: false,
        default:false
    },

    numberOfHits:{
        type:Number,
        required:false,
        default:0
    }
});

const remote_database_endpoints_schema = mongoose.model("remote_database_endpoints_schema", host_user);
module.exports = {remote_database_endpoints_schema};