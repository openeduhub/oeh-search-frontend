require('dotenv').config();

const PROXY_CONFIG = {};

if (process.env.RELAY_PROXY_URL) {
    // For some reason, the proxy doesn't forwarding the path with the request anymore. Therefore,
    // we hard-code `/graphql` here for now.
    PROXY_CONFIG['/relay/graphql'] = {
        target: process.env.RELAY_PROXY_URL + '/graphql',
        changeOrigin: true,
    };
}

module.exports = PROXY_CONFIG;
