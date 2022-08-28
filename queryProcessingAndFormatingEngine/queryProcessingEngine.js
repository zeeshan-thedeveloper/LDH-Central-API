const { get_host_info_list_cache, getItem_available_and_connected_host_list_cache, addUpdate_developers_host_access_url_request_list_cache, getItem_developers_host_access_url_request_list_cache } = require("../cache-store/cache-operations");
const { notifyHostForNewJob } = require("../notification-manager/notification-manager");
const { server}  = require("../index")
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const { Server } = require("socket.io");
const emiter = require("../events-engine/Emiters");
const events = require("../events-engine/Events")

// This will contain method which we will be required to process a developer's request:
const checkIfHostIsConnectedAndOnline=(hostId,query,databaseName,requestId,secretKey,adminId)=>{
    return new  Promise(function(resolve, reject){
        //lets check first if already connected or not.
        const availability = getItem_available_and_connected_host_list_cache(hostId);
        console.log("Avail : ",availability)
        if(availability!=null){
            console.log("already available")
            resolve(true);
        }else{
        console.log("Notifying the host")    
        notifyHostForNewJob(hostId,query,databaseName,requestId,secretKey,adminId).then((data)=>{
            if(data!=null){
                // console.log("resolved notifying")
                resolve(true)
            }else{
                // console.log("could not find the host")
                reject("Could not find the host in record")
            }
        },(err)=>{
            // console.log("Error occurred",err)
            reject("Error while notifying host.!!")
        })

        }
    })
}

const sendMySQLQueryToHost=(query,databaseName,hostId,requestId,secretKey,adminId)=>{
    // console.log("sendMySQLQueryToHost")
    // const requestId = uuidv1();
    emiter.emit(events.SEND_MYSQL_QUERY_TO_HOST,hostId,{
        query,databaseName,hostId,requestId,secretKey,adminId
    });
    addUpdate_developers_host_access_url_request_list_cache(hostId,requestId,query,databaseName,null,secretKey,adminId); //this cache stores the request sent to hosts.
    return requestId;
}

const checkForMYSQLRequestStatus=(requestId) => {
    return new Promise((resolve, reject) => {

        // What will happen in this function is that we will search the cache and as soon as we got
        // the record with response then will terminate the timer and resolve the function

        //TODO:Make request cache traversing efficient
       
        let timer=0;
        let response=null;
        const timerId = setInterval(() =>{
            timer++;
            if(timer==10){
                //time up
                clearInterval(timerId);
                resolve(response)
            }else{
                const response = getItem_developers_host_access_url_request_list_cache(requestId);
                if(response.response!=null){
                    clearInterval(timerId);
                    resolve(response);
                }
            }
        },1000)

    })
}

module.exports ={
    checkIfHostIsConnectedAndOnline,
    sendMySQLQueryToHost,
    checkForMYSQLRequestStatus
}