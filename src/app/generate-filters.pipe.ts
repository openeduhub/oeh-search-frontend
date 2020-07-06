import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from './config.service';
import { Language, SkosEntry } from '../generated/graphql';

/**
 * Extend the `filters` of the search component with another attribute.
 *
 * Implemented as pipe to omit unnecessary recalculation.
 */
@Pipe({
    name: 'generateFilters',
})
export class GenerateFiltersPipe implements PipeTransform {
    private static knownMissingTranslations: SkosEntry[] = [];
    private readonly language: Language;

    constructor(config: ConfigService) {
        this.language = config.getLanguage();
    }

    transform(
        value: string | SkosEntry,
        field: string,
        filters: object = {},
        isTextField = true,
    ): object {
        let filterKey: string;
        let filterValue: string;
        if (typeof value === 'object' && value.__typename === 'SkosEntry') {
            filterKey = `${field}.${this.language}.keyword`;
            filterValue = value.label;
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

function isEqual(lhs: SkosEntry, rhs: SkosEntry) {
    return JSON.stringify(lhs) === JSON.stringify(rhs);
}
