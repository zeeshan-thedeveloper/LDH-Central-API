const { get_host_info_list_cache } = require("../cache-store/cache-operations");
const { host_users_schema } = require("../mongodb/schemas/host-schemas/host-users");
const { checkIfHostIsConnectedAndOnline } = require("../queryProcessingAndFormatingEngine/queryProcessingEngine");
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

const executeMysqlQuery=async (req, res)=>{
  const {secretKey,hostAccessUrl,query,databaseName} = req.body
  const response = ()=>{
    return new Promise(async (resolve, reject) => {
      // this will be resolved only when data is fetched from host.
      // and we need to create a request manager to handle the remote requests and responses
      let hostId = hostAccessUrl.split("/")[2];
      // let hostDeviceId = await get_host_info_list_cache(hostId);
      //check if host is currently available on line or not?
      //if not available then make notification request.
      checkIfHostIsConnectedAndOnline(hostId).then((response)=>{
        resolve(response);
      })
    })
  }

  const dataToResend = await response();
  res.send({
    responseMessage:"Successfully resolved the query with response  "+dataToResend,
    responsePayload:dataToResend
  })
}

module.exports ={
    setStatusOfHostAccessUrl,
    getHostAccessUrlToken,
    executeMysqlQuery
}
