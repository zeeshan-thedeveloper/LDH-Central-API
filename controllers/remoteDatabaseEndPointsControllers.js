const {
  remote_database_endpoints_schema,
} = require("../mongodb/schemas/remote-database-endpoints/remote-database-endpoints");

const { DATA_STORED, DATA_NOT_STORED, FETCHED, COULD_NOT_FETCH } = require("./responses/responses");

const createRemoteDatabaseEndpoint = (req, res) => {
  const { hostAccessUrl, query, databaseName, description, url,hostName } = req.body;
  let hostId = hostAccessUrl.split("/")[2];
  let adminId = hostAccessUrl.split("/")[3];
  const centralApiServerUrl = process.env.CENTRAL_SERVER;
  // <Host>/executeRemoteDatabaseQuery/<REQUEST_ID>/<URL>/?apiKey=""
  const urlId = Math.round(new Date().getTime() / 1000);
//   const endpointUrl = `${centralApiServerUrl}/executeRemoteDatabaseQuery/${urlId}/${url}/?yourApikey=`;
     const endpointUrl = `/executeRemoteDatabaseQuery/${urlId}/${url}/?yourApikey=`;

  remote_database_endpoints_schema.create({
    urlId:urlId,
    url: url,
    hostUrl: hostAccessUrl,
    urlDescription: description,
    urlQuery: query,
    urlDatabaseName: databaseName,
    sourceHostId: hostId,
    ownerAdminId: adminId,
    endPointUrlAddress: endpointUrl,
    sourceHostName:hostName
  },(err,data)=>{
    if(!err){
      
        console.log(listOfUrls)
        res.status(200).send({
            responseMessage: "Successfully stored data in db",
            responseCode: DATA_NOT_STORED,
            responsePayload: data,
          });  
    }else{
        res.status(200).send({
            responseMessage: "Error while storing data in database",
            responseCode: DATA_NOT_STORED,
            responsePayload: err,
          });       
    }
  });
 
};

const getListOfRemoteDatabaseAccessUrlsByAdminId=(req,res)=>{
    const {adminId}=req.body
    remote_database_endpoints_schema.find({ownerAdminId:adminId},(err,data)=>{
        if(!err){
            res.status(200).send({
                responseMessage:"Successfully loaded list of remote database endpoints",
                responseCode:FETCHED,
                responsePayload:data.map((url)=>{
                  url.endPointUrlAddress=process.env.CENTRAL_SERVER+url.endPointUrlAddress
                  return url
                })
            })
        }else{
            res.status(200).send({
                responseMessage:"Could not load list of remote database endpoints",
                responseCode:COULD_NOT_FETCH,
                responsePayload:err
            })
        }
    })
}

const executeRemoteDatabaseQuery=(req,res)=>{
    res.status(200).send({
        responseMessage:"Loaded all remote database access urls"
    })
}

module.exports = {
  createRemoteDatabaseEndpoint,
  executeRemoteDatabaseQuery,
  getListOfRemoteDatabaseAccessUrlsByAdminId
};
