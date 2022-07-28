const { get_host_info_list_cache } = require("../cache-store/cache-operations");
const { notifyHostForNewJob } = require("../notification-manager/notification-manager");

// This will contain method which we will be required to process a developer's request:
const checkIfHostIsConnectedAndOnline=(hostId)=>{
    return new  Promise(function(resolve, reject){
        console.log("Notifying the host")
        notifyHostForNewJob(hostId).then((data)=>{
            console.log("Resolved the checking function")
            resolve(data)
        }).catch((err)=>{
            reject(err)
        })
    })
}

module.exports ={
    checkIfHostIsConnectedAndOnline,
}