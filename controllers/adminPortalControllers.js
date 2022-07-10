
const { dev_admin_con_schema } = require("../mongodb/schemas/developer-and-admin-connection-schema/developer-and-admin-connection-schema");
const { FETCHED, COULD_NOT_FETCH, DATA_UPDATED, DATA_NOT_UPDATED } = require("./responses/responses");

const getListOfDevelopersRequestsByAdminId=(req,res)=>{
    const {adminId}=req.body;
    dev_admin_con_schema.find({$and:[{adminId:adminId},{$or:[{requestStatus:"Un-resolved"},{requestStatus:"Decline"}]}]},(err, data)=>{
        if(data){
            res.status(200).send({
                responseMessage:"List of connection requests fetched",
                responseCode:FETCHED,
                responsePayload:data
            });
        }else{
            res.status(200).send({
                responseMessage:"List of connection requests could not fetched",
                responseCode:COULD_NOT_FETCH,
                responsePayload:err
            });
          
        }
    })
  
}

const getListOfDevelopersAccountsByAdminId=(req,res)=>{
    const {adminId}=req.body;
    dev_admin_con_schema.find({$and:[{adminId:adminId},{$or:[{requestStatus:"Accept"}]}]},(err, data)=>{
        if(data){
            res.status(200).send({
                responseMessage:"List of connection requests fetched",
                responseCode:FETCHED,
                responsePayload:data
            });
        }else{
            res.status(200).send({
                responseMessage:"List of connection requests could not fetched",
                responseCode:COULD_NOT_FETCH,
                responsePayload:err
            });
          
        }
    })
  
}


const updateStatusOfDevConReq= async (req,res)=>{
    const {requestId,requestStatus}=req.body;
    
    const record = await dev_admin_con_schema.findOneAndUpdate(
        {_id:requestId },
        { requestStatus: requestStatus },
        { new: true }
      );
      if (record) {
        // ------------------------------
            // We have to add this in the relative admin and developer for ease of fetching the records.
        // -----------------------------
        res.status(200).send({
            responseMessage:" Connection Status updated successfully",
            responseCode:DATA_UPDATED,
            responsePayload:record
        })
      }else{
        console.log("Status not updated")
        res.status(200).send({
            responseMessage:" Connection Status could not updated successfully",
            responseCode: DATA_NOT_UPDATED,
            responsePayload:record
        })
    }
}


module.exports={
    getListOfDevelopersRequestsByAdminId,
    updateStatusOfDevConReq,
    getListOfDevelopersAccountsByAdminId
}