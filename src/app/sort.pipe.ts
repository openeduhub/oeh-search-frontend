import { Pipe, PipeTransform } from '@angular/core';
import { ExtendedHit } from './search-results/search-results.component';
import { Details } from './search.service';

/**
 * Extend the `filters` of the search component with another attribute.
 *
 * Implemented as pipe to omit unnecessary recalculation.
 */
@Pipe({
    name: 'sort',
})
export class SortPipe implements PipeTransform {
    transform<T>(value: T[], config: SortConfiguration): T[] {
        value.sort((a, b) => {
            const keyA = config.key ? a[config.key] : a;
            const keyB = config.key ? b[config.key] : b;

            return (config.values.indexOf(keyA) < config.values.indexOf(keyB) ? -1 : 1) *
                   (config.ascending === false ? -1 : 1);
        });
        return value;
    }
}
export interface SortConfiguration {
    key?: string;
    values: string[];
    ascending?;
}
