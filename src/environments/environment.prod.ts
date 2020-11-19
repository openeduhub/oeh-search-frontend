import { ExtendedWindow } from './env';

declare var window: ExtendedWindow;

export const environment = {
    production: true,
    relayUrl: window.__env?.RELAY_URL ?? window.location.origin + '/relay',
    showExperiments: window.__env?.SHOW_EXPERIMENTS ?? false,
    editorBackendUrl: window.location.origin + '/editor',
    openId: {
        issuer: 'https://idm.wirlernenonline.de/auth/realms/master',
        clientId: 'oeh-search-frontend',
    },
};
