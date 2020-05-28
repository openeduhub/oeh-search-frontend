import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService, ShortLocale } from './config.service';
import { InternationalString } from '../generated/graphql';

const fallbackLocale = 'de';

@Pipe({
    name: 'valuespacesI18n',
})
export class ValuespacesI18nPipe implements PipeTransform {
    readonly shortLocale: ShortLocale;

    constructor(config: ConfigService) {
        this.shortLocale = config.getShortLocale();
    }

    transform(value: InternationalString): string {
        return value[this.shortLocale] || value[fallbackLocale];
    }
}
