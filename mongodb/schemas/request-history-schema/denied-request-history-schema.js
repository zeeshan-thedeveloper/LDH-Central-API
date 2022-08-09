const mongoose = require("mongoose");
const requests = new mongoose.Schema({
    requestId: {
        type: String,
        required: true, //email of developer
      },
    requestSender: {
        type: String,
        required: true, //email of developer
      },
    requestTargetHost: {
        type: String,
        required: true, // host id
      },
    requestPayload:{
        type: String,
        required: true,
      },
    requestDateAndTime:{
        type: String,
        required: true,  
    },
    requestStatus:{
        type: String,
        required: true,
    },
    requestResolved:{
        type:Boolean,
        required:true
    },
    adminId:{
      type: String,
      required: true,
    }
});

const denied_requests_history_schema = mongoose.model("denied_requests_history_schema", requests);
module.exports = {denied_requests_history_schema};