import { Pipe, PipeTransform } from '@angular/core';
import { Collection, ResultNode } from '../edu-sharing/edu-sharing.service';

export type CollectionType = 'EDITORIAL';

export function collectionHasType(collection: Collection, type: CollectionType): boolean {
    return collection.properties['ccm:collectiontype']?.includes(type);
}

@Pipe({
    name: 'inCollectionWithType',
})
export class InCollectionWithTypePipe implements PipeTransform {
    transform(value: ResultNode, type: CollectionType): boolean {
        return value.usedInCollections.some((collection) => collectionHasType(collection, type));
    }
}
