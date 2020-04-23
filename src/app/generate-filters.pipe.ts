import { Pipe, PipeTransform } from '@angular/core';

/**
 * Extend the `filters` of the search component with another attribute.
 *
 * Implemented as pipe to omit unnecessary recalculation.
 */
@Pipe({
    name: 'generateFilters',
})
export class GenerateFiltersPipe implements PipeTransform {
    transform([key, value]: [string, string[]], filters: object = {}): object {
        return {
            filters: JSON.stringify({
                ...filters,
                [key]: value,
            }),
        };
    }
}
