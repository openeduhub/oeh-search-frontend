import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService, ShortLocale } from './config.service';
import { InternationalString } from '../../elasticsearch-relay/src/generated/graphql';

/**
 * Extend the `filters` of the search component with another attribute.
 *
 * Implemented as pipe to omit unnecessary recalculation.
 */
@Pipe({
    name: 'generateFilters',
})
export class GenerateFiltersPipe implements PipeTransform {
    readonly shortLocale: ShortLocale;

    constructor(config: ConfigService) {
        this.shortLocale = config.getShortLocale();
    }

    transform(value: string | InternationalString, field: string, filters: object = {}): object {
        let filterKey: string;
        let filterValue: string;
        if (typeof value === 'object' && value.__typename === 'InternationalString') {
            filterKey = `${field}.${this.shortLocale}.keyword`;
            filterValue = value[this.shortLocale];
            if (!filterValue) {
                console.warn('Missing translation', value);
                return null;
            }
        } else if (typeof value === 'string') {
            filterKey = `${field}.keyword`;
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
