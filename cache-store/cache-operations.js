const {requestsListCache,admin_accounts_cache,hosts_info_list_cache, developers_host_access_url_request_list_cache, available_and_connected_host_list_cache} = require('./cache')

const getItem_admin_accounts_cache=(id)=>{
    let  list =admin_accounts_cache.get("admin_accounts_cache") 
    let user=null;
        list.forEach(element => {
            if (element.id==id){
                // console.log("Found it back", element)
                user = element;
            }
        });
        return user;
}

const get_host_info_list_cache=(hostId) => {
    return new Promise((resolve, reject) => {
        let  list =hosts_info_list_cache.get("hosts_info_list_cache") 
        list.forEach(element => {
                console.log(hostId)
                if (element.hostId===hostId){
                    // console.log("Present host ",element)
                    resolve(element)
                    return null
                }
            });

            reject(null);
    })
}

const addOrUpdate_host_info_list_cache=(hostId,hostDeviceId,lastSeenDateAndTime) => {
    let  list = hosts_info_list_cache.get("hosts_info_list_cache") 
    let flag=false;

    list = list.map(element => {
        if (element.hostId==hostId){
            element.hostId = hostId;
            element.hostDeviceId = hostDeviceId;
            element.lastSeenDateAndTime = lastSeenDateAndTime;
            flag=true;
            return element;
        }
    });
    if(!flag){
        hosts_info_list_cache.get("hosts_info_list_cache").push({
            hostId:hostId,
            hostDeviceId: hostDeviceId,
            lastSeenDateAndTime:lastSeenDateAndTime
        });
    }
    else{
        hosts_info_list_cache.put("hosts_info_list_cache",list);
    }
    return list;
}

const addUpdate_developers_host_access_url_request_list_cache=(hostId,requestId,query,database,response) => {
    let  list = developers_host_access_url_request_list_cache.get("developers_host_access_url_request_list_cache") 
    let flag=false;
    /*
    {
        requestId:"",
        hostId:"",
        query:"",
       
        database:"",
        response:"",
    }
     */

    list = list.map(element => {
        if (element.requestId==requestId) {
            element.requestId=requestId,
            element.hostId=hostId,
            element.query=query,
            element.database=database,
            element.response=response,
            flag=true;
            console.log("Request updated  : ",requestId)
            return element;
        }
    });
    if(!flag){
        developers_host_access_url_request_list_cache.get("developers_host_access_url_request_list_cache").push({
           requestId:requestId,
           hostId:hostId,
           query:query,
           database:database,
           response:response,
        });
        console.log("Request new added  : ",requestId)
    }
    else{
        developers_host_access_url_request_list_cache.put("developers_host_access_url_request_list_cache",list);
    }

    return list;
}

const addUpdate_available_and_connected_host_list_cache=(hostId,hostDeviceId,connectionStatus) => {
    let  list = available_and_connected_host_list_cache.get("available_and_connected_host_list_cache") 
    let flag=false;
    /*
    {
        hostId:hostId,
        hostDeviceId: hostDeviceId,
    }
     */
    list = list.map(element => {
        if (element.hostId==hostId) {
         
            element.hostId=hostId,
            element.hostDeviceId= hostDeviceId,
            element.connectionStatus=connectionStatus
            flag=true;
            return element;
        }
    });
    if(!flag){
        available_and_connected_host_list_cache.get("available_and_connected_host_list_cache").push({
           hostId:hostId,
           hostDeviceId: hostDeviceId,
           connectionStatus:connectionStatus
        });
    }
    else{
        available_and_connected_host_list_cache.put("available_and_connected_host_list_cache",list);
    }
    console.log("updated cache available_and_connected_host_list_cache ")
    return list;
}

const getItem_available_and_connected_host_list_cache=(hostId)=>{
    let  list =available_and_connected_host_list_cache.get("available_and_connected_host_list_cache") 
    let user=null;
        list.forEach(element => {
            if (element.hostId==hostId){
                user = element;
            }
        });

    return user;
}

const getItem_developers_host_access_url_request_list_cache=(requestId)=>{
    let  list =developers_host_access_url_request_list_cache.get("developers_host_access_url_request_list_cache") 
    let user=null;
        list.forEach(element => {
            if (element.requestId==requestId){
                user = element;
            }
        });
    return user;
}

module.exports={
    getItem_admin_accounts_cache,
    get_host_info_list_cache,
    addOrUpdate_host_info_list_cache,
    addUpdate_developers_host_access_url_request_list_cache,
    addUpdate_available_and_connected_host_list_cache,
    getItem_available_and_connected_host_list_cache,
    getItem_developers_host_access_url_request_list_cache
}