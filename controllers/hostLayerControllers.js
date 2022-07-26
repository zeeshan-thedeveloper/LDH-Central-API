// addHostInRequestList
// it will generate a unique id .. which will be as communication channel id
// connectHostToAdmin
// it will create rabitMQ queue .. and will make flag true : isConnected
// isHostConnected
// Note : communication will be done by using socket.io
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const { hosts_info_list_cache } = require("../cache-store/cache");
const { addOrUpdate_host_info_list_cache } = require("../cache-store/cache-operations");
const {
  admin_users_schema,
} = require("../mongodb/schemas/admin-schemas/admin-users");
const {
  host_users_schema,
} = require("../mongodb/schemas/host-schemas/host-users");
const { SERVER_BASE_URL } = require("../request-manager/urls");
const {
  COULD_NOT_CREATE_ACCOUNT,
  ACCONT_CREATED,
  ALREADY_CREATED_ACCOUNT,
  FETCHED,
  DATA_UPDATED,
  COULD_NOT_FETCH,
} = require("./responses/responses");

const addHostInRequestList = (req, res) => {
  const { adminId,hostDeviceId ,hostId,hostName } = req.body;
  // Checking if already have created or requested or not?

  host_users_schema.findOne({ hostId: hostId }, (err, data) => {
    if (data == null) {
      const dataToInsert = {
        // hostDeviceId: hostDeviceId,
        hostId: hostId, //this will be given to host when it will first time connec to central api or ... it will get installed .. note that it will be generated by central api
        connectedAdmin: new Object(adminId),
        isConnected: "Pending",
        hostName:hostName,
        hostAcessUrl:{
          url:`/${hostName}/${hostId}`,
          numberOfHits:0
        }
      };
      // Creating account for host
      host_users_schema.create(dataToInsert, async (err, insertedData) => {
        if (!err) {
          // updating the targeted admin
          const record = await admin_users_schema.findOneAndUpdate(
            { _id: adminId },
            {  
              $push: {
                connectedHostList:dataToInsert._id, //inserted data is the object to be inserted
              }
            }, 
            { new: true }
          );
          if (record) {
            // updated the admin
            addOrUpdate_host_info_list_cache(hostId, hostDeviceId);
            res.status(200).send({
              responseMessage: " Host added to waiting list successfully",
              responseCode: ACCONT_CREATED,
              responsePayload: insertedData,
            });
          } else {
            res.status(200).send({
              responseMessage: "Could not update the admin record",
              responseCode: ACCONT_CREATED,
              responsePayload: insertedData,
            });
          }
        } else {
          res.status(501).send({
            responseMessage:
              " Could not add add host  to waiting list successfully",
            responseCode: COULD_NOT_CREATE_ACCOUNT,
            responsePayload: err,
          });
        }
      });
    } else {
      res.status(200).send({
        responseMessage: " Already request",
        responseCode: ALREADY_CREATED_ACCOUNT,
        responsePayload: data,
      });
    }
  });
};

const getListOfPendingHostsByAdminId= (req, res) => {
  const {_id} = req.body;
  // host_users_schema.find({connectedAdmin:_id,isConnected:  "Pending"}).populate("connectedAdmin").then((data)=>{

  host_users_schema.find({$and:[{connectedAdmin:_id},{$or:[{isConnected:"Pending"},{isConnected:"Reject"},{isConnected:"Dis-connect"}]}]}).populate("connectedAdmin").then((data)=>{
    console.log("populated data : ",data)
    // Now get the last seen from local cache and then send response back.
    let result = [];
    let  list = hosts_info_list_cache.get("hosts_info_list_cache") 

    data.forEach((item)=>{ 
        let record={
          hostName:item.hostName,
          hostId:item.hostId,
          isConnected: item.isConnected,
          hostAcessUrl:item.hostAcessUrl
        }
        let flag=false;
        list.forEach((storedHostInfo)=>{
          if(storedHostInfo.hostId==item.hostId){
            record = {...record,lastSeenDateAndTime:storedHostInfo.lastSeenDateAndTime}
            flag=true;
          }
        })
        if(!flag){
          record = {...record,lastSeenDateAndTime:"Not online"}
        }
        result.push(record);
    })

    res.status(200).send({
      responseMessage:"List of pending hosts",
      responseCode:FETCHED,
      payload:result
    })

  }).catch((err)=>{

    res.status(501).send({
      responseMessage:"Could not loadt the list of pending hosts",
      responseCode:COULD_NOT_FETCH,
      payload:err
    })
  }) 
}

const getListOfConnectedHostsByAdminId= (req, res) => {
  const {_id} = req.body;
  // host_users_schema.find({connectedAdmin:_id,isConnected:  "Pending"}).populate("connectedAdmin").then((data)=>{

  host_users_schema.find({$and:[{connectedAdmin:_id},{$or:[{isConnected:"Connect"}]}]}).populate("connectedAdmin").then((data)=>{
    // console.log("populated data : ",data)
    // Now get the last seen from local cache and then send response back.
    let result = [];
    let  list = hosts_info_list_cache.get("hosts_info_list_cache") 
    data.forEach((item)=>{
        let record={
          hostName:item.hostName,
          hostId:item.hostId,
          isConnected: item.isConnected,
          hostAcessUrl:item.hostAcessUrl
        }
        let flag=false;
        list.forEach((storedHostInfo)=>{
          if(storedHostInfo.hostId==item.hostId){
            record = {...record,lastSeenDateAndTime:storedHostInfo.lastSeenDateAndTime}
            flag=true;
          }
        })
        if(!flag){
          record = {...record,lastSeenDateAndTime:"Not online"}
        }
        result.push(record);
    })
    res.status(200).send({
      responseMessage:"List of connected hosts",
      responseCode:FETCHED,
      payload:result
    })

  }).catch((err)=>{
    res.status(501).send({
      responseMessage:"Could not loadt the list of connected hosts",
      responseCode:COULD_NOT_FETCH,
      payload:err
    })
  }) 
}

const updateHostConnectionStatus = async (req, res) => {
  const {hostId,adminId,status}=req.body;
 
  const record = await host_users_schema.findOneAndUpdate(
    {hostId:hostId,connectedAdmin: adminId},
    {  
      isConnected:status,
      $set:{"hostAcessUrl.status":(status=="Connect") ? true : false}  
      //TODO: this could have been in control of admin. 
    }, 
    { new: true }
  );
  if (record) { 
    // record updated
    res.status(200).send({
      responseMessage:"Host status updated",
      responseCode:DATA_UPDATED,
      payload:record
    })
  }else{
    // record not updated
    res.status(200).send({
      responseMessage:"could not update the host status ",
      responseCode:DATA_NOT_UPDATED,
      payload:record
    })
  }
};

const isHostConnected = (req, res) => {
  res.send("isHostConnected");
};

const getUniqueId = (req, res) => {
  const uid = uuidv1();
  res.status(200).send({
    responseMessage:"Successfully generated unique id",
    responseCode:FETCHED,
    payload:uid
  })
}

const updateDeviceIdInCache = (req, res)=>{
  const {hostId,hostDeviceId,lastSeenDateAndTime} = req.body;
  addOrUpdate_host_info_list_cache(hostId, hostDeviceId,lastSeenDateAndTime);
  res.status(200).send({
    responseMessage:`Successfully updated the device id : ${hostDeviceId}  `,
    responseCode:DATA_UPDATED
  })
}

const getInfo = (req, res) => {
  let  list = hosts_info_list_cache.get("hosts_info_list_cache") 
  res.status(200).send({
    host_cache_list:list
  }) 
}

module.exports = {
  addHostInRequestList,
  updateHostConnectionStatus,
  isHostConnected,
  getUniqueId,
  updateDeviceIdInCache,
  getListOfPendingHostsByAdminId,
  getListOfConnectedHostsByAdminId,
  getInfo
};
