import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { WloSearchConfig, WLO_SEARCH_CONFIG } from '../wlo-search-config';

export enum Language {
    De = 'de',
    En = 'en',
}

export type Config = WloSearchConfig & {
    readonly language: Language;
};

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    private readonly config: Config;

    constructor(
        @Inject(LOCALE_ID) locale: string,
        @Inject(WLO_SEARCH_CONFIG) public readonly wloSearchConfig: WloSearchConfig,
    ) {
        this.config = {
            language: this.getLanguage(locale),
            ...wloSearchConfig,
        };
    }

    get(): Config {
        return this.config;
    }

    private getLanguage(locale: string): Language {
        switch (locale) {
            case 'en-US':
                return Language.En;
            case 'de':
                return Language.De;
            default:
                throw new Error(`unknown locale: ${locale}`);
        }
    }
}
