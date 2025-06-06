import { ExtendedWindow } from './env';

declare var window: ExtendedWindow;

export const environment = {
    production: true,
    eduSharingApiUrl: window.__env?.EDU_SHARING_API_URL ?? '/edu-sharing-api',
    eduSharingUsername: window.__env?.EDU_SHARING_USERNAME,
    eduSharingPassword: window.__env?.EDU_SHARING_PASSWORD,
    wordpressUrl: window.__env?.WORDPRESS_URL ?? 'https://wirlernenonline.de',
    analyticsUrl: window.__env?.ANALYTICS_URL ?? '/analytics',
};
