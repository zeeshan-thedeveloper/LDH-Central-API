const { requests_history_schema } = require("../mongodb/schemas/request-history-schema/request-history-schema");

const addRequestInRequestHistory = (
  requestId,
  requestSender,
  requestTargetHost,
  requestPayload,
  requestDateAndTime,
  requestStatus,
  requestResolved
) => {
  return new Promise((resolve, reject) => {
    requests_history_schema.create({
        requestId,
        requestSender,
        requestTargetHost,
        requestPayload,
        requestDateAndTime,
        requestStatus,
        requestResolved
    },(err,data)=>{
        if(!err) resolve(data)
        else reject(err)
    })
  });
};

module.exports={
    addRequestInRequestHistory
}