import { Pipe, PipeTransform } from '@angular/core';
import { InternationalString } from '../generated/graphql';
import { ConfigService, ShortLocale } from './config.service';

/**
 * Extend the `filters` of the search component with another attribute.
 *
 * Implemented as pipe to omit unnecessary recalculation.
 */
@Pipe({
    name: 'generateFilters',
})
export class GenerateFiltersPipe implements PipeTransform {
    private static knownMissingTranslations: InternationalString[] = [];
    private readonly shortLocale: ShortLocale;

    constructor(config: ConfigService) {
        this.shortLocale = config.getShortLocale();
    }

    transform(
        value: string | InternationalString,
        field: string,
        filters: object = {},
        isTextField = true,
    ): object {
        let filterKey: string;
        let filterValue: string;
        if (typeof value === 'object' && value.__typename === 'InternationalString') {
            filterKey = `${field}.${this.shortLocale}.keyword`;
            filterValue = value[this.shortLocale];
            if (!filterValue) {
                if (
                    !GenerateFiltersPipe.knownMissingTranslations.some((entry) =>
                        isEqual(entry, value),
                    )
                ) {
                    GenerateFiltersPipe.knownMissingTranslations.push(value);
                    console.warn('Missing translation', value);
                }
                return null;
            }
        } else if (typeof value === 'string') {
            filterKey = isTextField ? `${field}.keyword` : field;
            filterValue = value;
        } else {
            throw new Error(`Cannot generate filter of ${value}`);
        }
        return {
            pageIndex: 0,
            filters: JSON.stringify({
                ...filters,
                [filterKey]: [filterValue],
            }),
        };
    }
}

function isEqual(lhs: InternationalString, rhs: InternationalString) {
    return JSON.stringify(lhs) === JSON.stringify(rhs);
}
