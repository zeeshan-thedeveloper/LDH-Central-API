const { host_users_schema } = require("../mongodb/schemas/host-schemas/host-users");
const { DATA_UPDATED, DATA_NOT_UPDATED } = require("./responses/responses");

const setStatusOfHostAccessUrl=async (req, res)=>{
    const {hostId,status}=req.body;
    const record = await host_users_schema.findOneAndUpdate(
        { hostId: hostId},
        {  
            $set:{"hostAcessUrl.status":status}
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

module.exports ={
    setStatusOfHostAccessUrl
}
