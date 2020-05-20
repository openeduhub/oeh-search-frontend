export const environment = {
    production: true,
    relayUrl: window.location.origin + '/relay',
    editorBackendUrl: window.location.origin + '/editor',
    openId: {
        issuer: 'https://idm.wirlernenonline.de/auth/realms/master',
        clientId: 'oeh-search-frontend',
    },
};
