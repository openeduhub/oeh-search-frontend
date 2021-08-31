import { Inject, Injectable, LOCALE_ID } from '@angular/core';

export enum Language {
    De = 'de',
    En = 'en',
}

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    readonly language: Language;

    constructor(@Inject(LOCALE_ID) locale: string) {
        switch (locale) {
            case 'en-US':
                this.language = Language.En;
                break;
            case 'de':
                this.language = Language.De;
                break;
            default:
                throw new Error(`unknown locale: ${locale}`);
        }
    }

    getLanguage(): Language {
        return this.language;
    }
}
