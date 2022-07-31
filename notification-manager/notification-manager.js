const Electrolytic = require('electrolytic');
const { get_host_info_list_cache, addUpdate_developers_host_access_url_request_list_cache } = require('../cache-store/cache-operations');
const axios = require('axios').default;
const electrolytic = Electrolytic({appKey: 'OmGci2murwT1NKqd791x'});
const fetch = require('cross-fetch')
const notifyHostForNewJob=(hostId,query,databaseName,requestId)=>{
    return new Promise((resolve, reject) => {
        console.log("notifyHostForNewJob")
        get_host_info_list_cache(hostId).then(async (host)=>{
          console.log("Host to who going to notify",host)
          if(host!=null){
           
          addUpdate_developers_host_access_url_request_list_cache(hostId,requestId,query,databaseName,null); 

          const response = await fetch("https://api.electrolytic.app/push/send", {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
              'Content-Type': 'application/json'
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({
                appKey: "OmGci2murwT1NKqd791x",
                appSecret: "e4b68f6e9c2459af5baa766d",
                target: [host.hostDeviceId], // should be an array. multiple tokens can be used to send the same push to all of them.
                payload: JSON.stringify({
                  hostId,query,databaseName,requestId
                }) // can also be a JSON object
            }) // body data type must match "Content-Type" header
          });
          const convertedResponse = response.json();
          resolve(convertedResponse)    
          }else{
            console.log("Not such host found")
            reject(null)
          }
        }).catch((error)=>{
            console.log("No such host found",error)
            reject(null)
        })

        // resolve("Notified host with completing the request.")       
    })
}

module.exports = {
    notifyHostForNewJob
}