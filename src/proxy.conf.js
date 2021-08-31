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
if (process.env.EDU_SHARING_API_PROXY_URL) {
    PROXY_CONFIG['/edu-sharing-api'] = {
        target: process.env.EDU_SHARING_API_PROXY_URL,
        changeOrigin: true,
        cookiePathRewrite: '',
        pathRewrite: {
            '^/edu-sharing-api': '',
        },
    };
}

module.exports = PROXY_CONFIG;
