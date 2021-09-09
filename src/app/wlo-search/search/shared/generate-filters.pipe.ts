import { Pipe, PipeTransform } from '@angular/core';
import { Facet } from '../../core/edu-sharing.service';
import { IdentifiedValue } from './nodeProperty.pipe';

/**
 * Extend the `filters` of the search component with another attribute.
 *
 * Implemented as pipe to omit unnecessary recalculation.
 */
@Pipe({
    name: 'generateFilters',
})
export class GenerateFiltersPipe implements PipeTransform {
    private static knownMissingTranslations: IdentifiedValue[] = [];

    constructor() {}

    transform(value: string | IdentifiedValue, facet: Facet, filters: object = {}): object {
        let filterValue: string;
        if (typeof value === 'object' && value.id) {
            filterValue = value.displayName;
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
            filterValue = value;
        } else {
            throw new Error(`Cannot generate filter of ${value}`);
        }
        return {
            pageIndex: 0,
            filters: JSON.stringify({
                ...filters,
                [facet]: [filterValue],
            }),
        };
    }
}

function isEqual(lhs: IdentifiedValue, rhs: IdentifiedValue) {
    return JSON.stringify(lhs) === JSON.stringify(rhs);
}
