require('dotenv').config();

const PROXY_CONFIG = [
    // Webpack doesn't like an empty proxy configuration.
    {
        context: ['/dummy'],
        target: '',
    },
];

if (process.env.RELAY_PROXY_URL) {
    PROXY_CONFIG.push({
        context: ['/relay'],
        target: process.env.RELAY_PROXY_URL,
        changeOrigin: true,
    });
}

module.exports = PROXY_CONFIG;
