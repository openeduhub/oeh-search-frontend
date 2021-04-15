import { ExtendedWindow, readBoolean } from './env';

declare var window: ExtendedWindow;

export const environment = {
    production: true,
    relayUrl: window.__env?.RELAY_URL ?? window.location.origin + '/relay',
    wordpressUrl: window.__env?.WORDPRESS_URL ?? 'https://wirlernenonline.de',
    showExperiments: readBoolean(window.__env?.SHOW_EXPERIMENTS, false),
    analyticsUrl: window.__env?.ANALYTICS_URL ?? window.location.origin + '/analytics',
};
