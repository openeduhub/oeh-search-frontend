export const environment = {
    production: true,
    relayUrl: window.location.origin + '/relay/graphql',
    editorBackendUrl: window.location.origin + '/editor/graphql',
    openId: {
        issuer: 'https://idm.wirlernenonline.de/auth/realms/master',
        clientId: 'oeh-search-frontend',
    },
};
