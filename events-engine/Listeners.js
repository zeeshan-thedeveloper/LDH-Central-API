var emiter = require('./Emiters');
const events = require('./Events');
const {produce} = require('immer')

// Cache
const {requestsListCache,admin_accounts_cache} = require('../cache-store/cache')
module.exports = {initEvents:()=>{
    emiter.on(events.INIT_CACHE,()=>{
        requestsListCache.put("requestsListCache",[]);
        admin_accounts_cache.put("admin_accounts_cache",[]);
        console.log('requestsListCache,adminAccountsCache : have been intialized.')
    })

    emiter.on(events.ADD_ITEM_request_cache,(data)=>{
         requestsListCache.put("requestsListCache", produce(list,draftList=>draftList.push(data)))
    })
    emiter.on(events.GET_ITEM_request_cache,(index)=>{
       let requestsList = requestsListCache.get("requestsListCache")
       return requestsList[index];
    })

    // Admin-accounts
    emiter.on(events.ADD_ITEM_admin_account_cache,(data)=>{
       admin_accounts_cache.get("admin_accounts_cache").push(data);
    })
    emiter.on(events.GET_ITEM_admin_account_cache,(key)=>{
        let  list =admin_accounts_cache.get("admin_accounts_cache") 
        console.log("admin_accounts_cache",list) 
    })
}}
