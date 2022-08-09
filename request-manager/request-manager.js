const { denied_requests_history_schema } = require("../mongodb/schemas/request-history-schema/denied-request-history-schema");

const addRequestInDeniedRequestHistory = (
  requestId,
  requestSender,
  requestTargetHost,
  requestPayload,
  requestDateAndTime,
  requestStatus,
  requestResolved,
  adminId
) => {
  return new Promise((resolve, reject) => {
    denied_requests_history_schema.create({
        requestId,
        requestSender,
        requestTargetHost,
        requestPayload,
        requestDateAndTime,
        requestStatus,
        requestResolved,
        adminId
    },(err,data)=>{
        if(!err) resolve(data)
        else reject(err)
    })
  });
};

module.exports={
  addRequestInDeniedRequestHistory
}