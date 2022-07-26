const { host_users_schema } = require("../mongodb/schemas/host-schemas/host-users");
const { generateTokenWithId } = require("../token-manager/token-manager");
const { DATA_UPDATED, DATA_NOT_UPDATED, FETCHED } = require("./responses/responses");

const setStatusOfHostAccessUrl=async (req, res)=>{
    const {hostId,status}=req.body;
    const record = await host_users_schema.findOneAndUpdate(
        { hostId: hostId},
        {  
            $set:{"hostAcessUrl.status":status}
            // TODO : this must be used from admin side.
        }, 
        { new: true }
      );
      if (record) {
        res.status(200).send({
            responseMessage: "Updated status of host",
            responseCode:DATA_UPDATED,
            payload:record
        })
      }else{
        res.status(200).send({
            responseMessage: " Could not updated status of host",
            responseCode:DATA_NOT_UPDATED,
            payload:record
        })
      }

}


const getHostAccessUrlToken=(req, res)=>{
  const {validationTime,id}=req.body;
  const token = generateTokenWithId({ token: id },validationTime);
  res.send({
    responseMessage:"Token Generated",
    responseCode:FETCHED,
    responsePayload:token
  })
}

module.exports ={
    setStatusOfHostAccessUrl,
    getHostAccessUrlToken
}
