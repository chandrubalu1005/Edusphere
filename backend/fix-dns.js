const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
console.log('[DNS-FIX] Applied Google/Cloudflare DNS resolvers for MongoDB Atlas SRV query.');
