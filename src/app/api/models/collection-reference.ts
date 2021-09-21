/* tslint:disable */
/* eslint-disable */
import { Collection } from './collection';
import { Content } from './content';
import { License } from './license';
import { Node } from './node';
import { NodeRef } from './node-ref';
import { Person } from './person';
import { Preview } from './preview';
import { RatingDetails } from './rating-details';
import { Remote } from './remote';
export interface CollectionReference {
    access: Array<string>;
    accessOriginal?: Array<string>;
    aspects?: Array<string>;
    collection: Collection;
    commentCount?: number;
    content?: Content;
    createdAt: string;
    createdBy: Person;
    downloadUrl: string;
    iconURL?: string;
    isDirectory?: boolean;
    license?: License;
    mediatype?: string;
    metadataset?: string;
    mimetype?: string;
    modifiedAt?: string;
    modifiedBy?: Person;
    name: string;
    originalId?: string;
    originalRestrictedAccess?: boolean;
    owner: Person;
    parent?: NodeRef;
    preview?: Preview;
    properties?: { [key: string]: Array<string> };
    rating?: RatingDetails;
    ref: NodeRef;
    remote?: Remote;
    repositoryType?: string;
    size?: string;
    title?: string;
    type?: string;
    usedInCollections?: Array<Node>;
}
