import { Component, Input } from '@angular/core';
import { Collection } from '../../../core/edu-sharing.service';
import { retrieveCustomUrl } from '../../../template/custom-definitions';
import { Node } from 'ngx-edu-sharing-api';

@Component({
    selector: 'app-collection-card',
    templateUrl: './collection-card.component.html',
    styleUrls: ['./collection-card.component.scss'],
})
export class CollectionCardComponent {
    @Input() collection: Collection;
    backgroundColor: string;
    backgroundType: 'dark' | 'light';

    constructor() {}

    retrieveCustomUrl: (node: Node) => string = retrieveCustomUrl;
}
