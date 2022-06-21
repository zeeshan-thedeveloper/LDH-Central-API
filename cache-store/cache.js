var cache = require('memory-cache');
var requestsListCache = new cache.Cache();
var admin_accounts_cache = new cache.Cache();
module.exports = {requestsListCache,admin_accounts_cache};