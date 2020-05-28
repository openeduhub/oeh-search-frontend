import { Inject, Injectable, LOCALE_ID } from '@angular/core';

export type ShortLocale = 'en' | 'de';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    constructor(@Inject(LOCALE_ID) private locale: string) {
        switch (locale) {
            case 'en-US':
            case 'de':
                break;
            default:
                throw new Error(`unknown locale: ${locale}`);
        }
    }

    getShortLocale(): ShortLocale {
        return this.locale.slice(0, 2) as ShortLocale;
    }
}
