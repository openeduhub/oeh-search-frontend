require('dotenv').config();

const PROXY_CONFIG = {};

if (process.env.RELAY_PROXY_URL) {
    // For some reason, the proxy doesn't forward the path with the request anymore. Therefore,
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
if (process.env.BACKEND_URL) {
    PROXY_CONFIG['/edu-sharing/rest'] = {
        target: process.env.BACKEND_URL,
        secure: false,
        changeOrigin: true,
        configure(proxy) {
            proxy.on('proxyRes', (proxyRes) => {
                proxyRes.headers['X-Edu-Sharing-Proxy-Target'] = process.env.BACKEND_URL;
                const cookies = proxyRes.headers['set-cookie'];
                if (cookies) {
                    proxyRes.headers['set-cookie'] = cookies.map((cookie) =>
                        cookie
                            .replace('; Path=/edu-sharing', '; Path=/')
                            // We serve on a non-HTTPS connection, so 'Secure' cookies won't work.
                            .replace('; Secure', '')
                            // 'SameSite=None' is only allowed on 'Secure' cookies.
                            .replace('; SameSite=None', ''),
                    );
                }
            });
        },
    };
}

module.exports = PROXY_CONFIG;
