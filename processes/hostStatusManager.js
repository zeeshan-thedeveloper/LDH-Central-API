// purpose of this function is to look after the state of connected hosts. This function will send a ping request after a 
// s short period of time to every host stored in available_and_connected_host_list_cache. If response is returned +ve then
// it will keep state as connected but in case if does not get response then it will change state to null. Note that we have
// already designed logic in executeMysqlQuery function that in case of null connection it will again notify to connect.


//Features of this component will be following
//1. when ever a disconnect happens this will send ping to all available connected hosts and in case of -ve response it will set status to disconnected
//2. it will ping for 2 times after 2 seconds.

const { workerData, parentPort } = require('worker_threads');
const emiter = require('../events-engine/Emiters');
const events = require('../events-engine/Events');

const pingTheHost=(hostId)=>{
    return new Promise((resolve, reject) => {
            // ping using socket.io stream which is already connected/established
            setTimeout(() =>{})
    })
}

workerData.forEach((host)=>{
    parentPort.postMessage({ host:host})  
})

