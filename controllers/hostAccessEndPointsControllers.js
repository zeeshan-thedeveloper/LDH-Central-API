const { get_host_info_list_cache, addUpdate_developers_host_access_url_request_list_cache } = require("../cache-store/cache-operations");
const emiter = require("../events-engine/Emiters");
const { host_users_schema } = require("../mongodb/schemas/host-schemas/host-users");
const { checkIfHostIsConnectedAndOnline, sendMySQLQueryToHost, checkForMYSQLRequestStatus } = require("../queryProcessingAndFormatingEngine/queryProcessingEngine");
const { generateTokenWithId } = require("../token-manager/token-manager");
const { DATA_UPDATED, DATA_NOT_UPDATED, FETCHED } = require("./responses/responses");
const events = require('../events-engine/Events');
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
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
      console.log("Recieved body from developer : ",req.body)
      let hostId = hostAccessUrl.split("/")[2]; 
      let adminId = hostAccessUrl.split("/")[3]; 
      
      //check if host is currently available on line or not?
      //if not available then make notification request.

     const requestId = Math.round(new Date().getTime() / 1000);
      checkIfHostIsConnectedAndOnline(hostId,query,databaseName,requestId,secretKey,adminId).then(async (response)=>{
        if(response){
          // available online
          if(response){
            // its available or notified.
            //so now lets send the query to the host.
            sendMySQLQueryToHost(query,databaseName,hostId,requestId,secretKey,adminId);
            console.log("Notified and sent the request with request id ",requestId);
            // Now look for request .. if that is resolved or not.
            const response = await checkForMYSQLRequestStatus(requestId);
            console.log(response)
            resolve(response);//we need to send query response.
          }else{
            // host could be found in any cache. .. need to restart the host application in this case.
            console.log("can not find host in cache")
            reject(null);
          }
        }
      },(err)=>{
        console.log("Error while  checkIfHostIsConnectedAndOnline",err)
        reject(null);
      })
      
    })
  }

  response().then((success)=>{
    console.log("Response -1 : ",success);
    res.send({
      responseMessage:"Successfully resolved the query with response  "+success,
      responsePayload:success
    })
  },(fail)=>{
    res.send({
      responseMessage:"could not successfully resolved the query with response  ",
      responsePayload:fail
    })
  })
}

const resolveMYSQLQuery=(req, res) => {
  const {hostId,requestId,query,response,databaseName} = req.body
  addUpdate_developers_host_access_url_request_list_cache(hostId,requestId,query,databaseName,response);
  res.status(200).send({responseMessage:"Resolved query successfully"})
}

module.exports ={
    setStatusOfHostAccessUrl,
    getHostAccessUrlToken,
    executeMysqlQuery,
    resolveMYSQLQuery,
}
