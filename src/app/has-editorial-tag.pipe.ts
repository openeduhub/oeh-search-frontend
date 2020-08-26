import { Pipe, PipeTransform } from '@angular/core';
import { Hit } from './search-results/search-results.component';
import { EditorialTag } from '../generated/graphql';

/**
 * Extend the `filters` of the search component with another attribute.
 *
 * Implemented as pipe to omit unnecessary recalculation.
 */
@Pipe({
    name: 'hasEditorialTag',
})
export class HasEditorialTagPipe implements PipeTransform {
    transform(value: Hit, tag: EditorialTag): boolean {
        return value.editorialTags.includes(tag);
    }
}
