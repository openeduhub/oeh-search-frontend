// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { ExtendedWindow } from './env';

declare var window: ExtendedWindow;

export const environment = {
    production: false,
    relayUrl: window.__env?.RELAY_URL ?? 'http://localhost:3000',
    wordpressUrl: window.__env?.WORDPRESS_URL ?? 'https://dev.wirlernenonline.de',
    showExperiments: window.__env?.SHOW_EXPERIMENTS ?? true,
    editorBackendUrl: 'http://localhost:3001',
    openId: {
        issuer: 'https://idm.wirlernenonline.de/auth/realms/master',
        clientId: 'oeh-search-frontend-dev',
    },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
