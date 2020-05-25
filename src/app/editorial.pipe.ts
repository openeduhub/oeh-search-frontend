import { Pipe, PipeTransform } from '@angular/core';
import { Details } from './search.service';
import { Hit } from '../generated/graphql';

/**
 * Extend the `filters` of the search component with another attribute.
 *
 * Implemented as pipe to omit unnecessary recalculation.
 */
@Pipe({
    name: 'editorial',
})
export class EditorialPipe implements PipeTransform {
    transform(value: Hit | Details): boolean {
        if (value.collection) {
            return value.collection.find((c) => c.data?.editorial) != null;
        }
        return false;
    }
}
