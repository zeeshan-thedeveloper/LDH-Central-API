const { get_host_info_list_cache, getItem_available_and_connected_host_list_cache, addUpdate_developers_host_access_url_request_list_cache } = require("../cache-store/cache-operations");
const { notifyHostForNewJob } = require("../notification-manager/notification-manager");
const { server}  = require("../index")
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const { Server } = require("socket.io");
const emiter = require("../events-engine/Emiters");
const events = require("../events-engine/Events")

// This will contain method which we will be required to process a developer's request:
const checkIfHostIsConnectedAndOnline=(hostId)=>{
    return new  Promise(function(resolve, reject){
        //lets check first if already connected or not.
        const availability = getItem_available_and_connected_host_list_cache(hostId);
        console.log("Avail : ",availability)
        if(availability!=null){
            console.log("already available")
            resolve(true);
        }else{
        console.log("Notifying the host")    
        notifyHostForNewJob(hostId).then((data)=>{
            if(data!=null){
                console.log("resolved notifying")
                resolve(true)
            }else{
                console.log("could not find the host")
                reject(false)
            }
        },(err)=>{
            console.log("Error occurred")
            reject(null)
        })

        }
    })
}

const sendMySQLQueryToHost=(query,databaseName,hostId)=>{
    console.log("sendMySQLQueryToHost")
    const requestId = uuidv1();
    emiter.emit(events.SEND_MYSQL_QUERY_TO_HOST,hostId,{
        query,databaseName,hostId,requestId
    });
    
    addUpdate_developers_host_access_url_request_list_cache(hostId,requestId,query,databaseName,null);
    return requestId;
}

module.exports ={
    checkIfHostIsConnectedAndOnline,
    sendMySQLQueryToHost
}