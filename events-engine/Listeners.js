var emiter = require('./Emiters');
const events = require('./Events');
const {produce} = require('immer')

// Cache
const {requestsListCache} = require('../cache-store/cache')
module.exports = {initEvents:()=>{
    emiter.on(events.INIT_CACHE,()=>{
        requestsListCache.put("requestsListCache",[]);
        console.log('requestsListCache : has been intialized.')
    })
    emiter.on(events.ADD_ITEM_request_cache,(data)=>{
         requestsListCache.put("requestsListCache", produce(list,draftList=>draftList.push(data)))
    })
    emiter.on(events.GET_ITEM_request_cache,(index)=>{
       let requestsList = requestsListCache.get("requestsListCache")
       return requestsList[index];
    })
}}
