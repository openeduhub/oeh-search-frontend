// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { ExtendedWindow } from './env';

declare var window: ExtendedWindow;

export const environment = {
    production: false,
    eduSharingApiUrl: window.__env?.EDU_SHARING_API_URL ?? '/edu-sharing-api',
    eduSharingUsername: window.__env?.EDU_SHARING_USERNAME,
    eduSharingPassword: window.__env?.EDU_SHARING_PASSWORD,
    wordpressUrl: window.__env?.WORDPRESS_URL ?? 'https://wordpress.staging.openeduhub.net',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
