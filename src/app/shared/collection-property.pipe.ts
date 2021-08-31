import { Pipe, PipeTransform } from '@angular/core';
import { Collection } from '../edu-sharing/edu-sharing.service';

@Pipe({
    name: 'collectionProperty',
})
export class CollectionPropertyPipe implements PipeTransform {
    private readonly collectionMappings = {
        title: (collection: Collection) =>
            collection.properties['cm:title']?.[0] || collection.properties['cm:name']?.[0],
        url: (collection: Collection) => collection.properties['cclom:location']?.[0],
        color: (collection: Collection) => collection.properties['ccm:collectioncolor']?.[0],
        childReferencesCount: (collection: Collection) =>
            collection.collection.childReferencesCount,
        childCollectionsCount: (collection: Collection) =>
            collection.collection.childCollectionsCount,
    };

    transform<P extends keyof CollectionPropertyPipe['collectionMappings']>(
        collection: Collection,
        property: P,
    ): ReturnType<CollectionPropertyPipe['collectionMappings'][P]> {
        return this.collectionMappings[property](collection) as ReturnType<
            CollectionPropertyPipe['collectionMappings'][P]
        >;
    }
}
