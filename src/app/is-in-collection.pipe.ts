import { Pipe, PipeTransform } from '@angular/core';
import { Hit } from './search-results/search-results.component';

/**
 * Extend the `filters` of the search component with another attribute.
 *
 * Implemented as pipe to omit unnecessary recalculation.
 */
@Pipe({
    name: 'isInCollection',
})
export class IsInCollectionPipe implements PipeTransform {
    transform(value: Hit, uuid: string): boolean {
        // return value.collection?.some((c) => c.uuid === uuid);
        return false;
    }
}
