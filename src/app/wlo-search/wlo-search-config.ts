import { InjectionToken } from '@angular/core';

export const WLO_SEARCH_CONFIG = new InjectionToken<WloSearchConfig>('WLO_SEARCH_CONFIG');

export interface WloSearchConfig {
    readonly routerPath: string;
    readonly wordpressUrl: string;
}
