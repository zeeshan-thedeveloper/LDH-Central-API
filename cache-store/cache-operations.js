const {requestsListCache,admin_accounts_cache,hosts_info_list_cache} = require('./cache')

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
const get_host_info_list_cache=(hostId,hostDeviceId) => {
    let  list =hosts_info_list_cache.get("hosts_info_list_cache") 
    let user=null;
        list.forEach(element => {
            if (element.hostId==hostId){
                user = element;
            }
        });

    // add in case not found in the list.
    // if(user==null){
    //     hosts_info_list_cache.get("hosts_info_list_cache").push({
    //         hostId:hostId,
    //         hostDeviceId: hostDeviceId,
    //     });
    // }    
        return user;
}

const addOrUpdate_host_info_list_cache=(hostId,hostDeviceId) => {
    let  list = hosts_info_list_cache.get("hosts_info_list_cache") 
    let flag=false;

    list = list.map(element => {
        if (element.hostId==hostId){
            element.hostId = hostId;
            element.hostDeviceId = hostDeviceId;
            flag=true;
            return element;
        }
    });
    if(!flag){
        hosts_info_list_cache.get("hosts_info_list_cache").push({
            hostId:hostId,
            hostDeviceId: hostDeviceId,
        });
    }
    else{
        hosts_info_list_cache.put("hosts_info_list_cache",list);
    }
    return list;
}


module.exports={
    getItem_admin_accounts_cache,
    get_host_info_list_cache,
    addOrUpdate_host_info_list_cache
}