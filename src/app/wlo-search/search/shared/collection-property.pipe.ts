import { Pipe, PipeTransform } from '@angular/core';
import { Collection } from '../../core/edu-sharing.service';

const collectionMappings = {
    title: (collection: Collection) =>
        collection.properties['cm:title']?.[0] || collection.properties['cm:name']?.[0],
    url: (collection: Collection) => collection.properties['cclom:location']?.[0],
    color: (collection: Collection) => collection.properties['ccm:collectioncolor']?.[0],
    childReferencesCount: (collection: Collection) => collection.collection.childReferencesCount,
    childCollectionsCount: (collection: Collection) => collection.collection.childCollectionsCount,
};

export function getCollectionProperty<P extends keyof typeof collectionMappings>(
    collection: Collection,
    property: P,
): ReturnType<typeof collectionMappings[P]> {
    return collectionMappings[property](collection) as ReturnType<typeof collectionMappings[P]>;
}

@Pipe({
    name: 'collectionProperty',
})
export class CollectionPropertyPipe implements PipeTransform {
    transform<P extends keyof typeof collectionMappings>(
        collection: Collection,
        property: P,
    ): ReturnType<typeof collectionMappings[P]> {
        return getCollectionProperty(collection, property);
    }
}
