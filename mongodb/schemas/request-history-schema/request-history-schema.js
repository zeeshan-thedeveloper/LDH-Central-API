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
    }
});

const requests_history_schema = mongoose.model("requests_history_schema", requests);
module.exports = {requests_history_schema};