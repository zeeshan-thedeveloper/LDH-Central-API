var cache = require('memory-cache');
var requestsListCache = new cache.Cache();
var admin_accounts_cache = new cache.Cache();
var hosts_info_list_cache = new cache.Cache();
var developers_host_access_url_list_cache = new cache.Cache();
var available_and_connected_host_list_cache = new cache.Cache();
module.exports = {requestsListCache,admin_accounts_cache,hosts_info_list_cache,developers_host_access_url_list_cache,available_and_connected_host_list_cache};