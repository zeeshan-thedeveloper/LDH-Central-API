var emiter = require("./Emiters");
const events = require("./Events");
const { produce } = require("immer");

// Cache
const {
  requestsListCache,
  admin_accounts_cache,
  hosts_info_list_cache,
  developers_host_access_url_request_list_cache,
  available_and_connected_host_list_cache,
} = require("../cache-store/cache");

module.exports = {
  initEvents: () => {
    
    emiter.on(events.SEND_MYSQL_QUERY_TO_HOST, (hostId,payload) => {
      // Since on client side we have registred the listners with host ids
      global.globalSocket.emit(hostId,JSON.stringify(payload));
    });
    emiter.on(events.INIT_CACHE, () => {
      requestsListCache.put("requestsListCache", []);
      admin_accounts_cache.put("admin_accounts_cache", []);
      hosts_info_list_cache.put("hosts_info_list_cache", []);
      developers_host_access_url_request_list_cache.put(
        "developers_host_access_url_request_list_cache",
        []
      );
      available_and_connected_host_list_cache.put(
        "available_and_connected_host_list_cache",
        []
      );
      console.log(
        "requestsListCache,adminAccountsCache,hosts_info_list_cache,available_and_connected_host_list_cache,developers_host_access_url_request_list_cache : have been intialized."
      );
    });
    // Requests
    emiter.on(events.ADD_ITEM_request_cache, (data) => {
      requestsListCache.put(
        "requestsListCache",
        produce(list, (draftList) => draftList.push(data))
      );
    });
    // Admin-accounts
    emiter.on(events.ADD_ITEM_admin_account_cache, (data) => {
      admin_accounts_cache.get("admin_accounts_cache").push(data);
    });
  },
};
