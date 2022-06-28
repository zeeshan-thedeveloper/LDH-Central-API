const {requestsListCache,admin_accounts_cache} = require('./cache')

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

module.exports={
    getItem_admin_accounts_cache    
}