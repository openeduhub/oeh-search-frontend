import { Component, Input } from '@angular/core';
import { Node } from 'ngx-edu-sharing-api';
import { Collection } from '../../../core/edu-sharing.service';
import { retrieveCustomUrl } from '../../../template/shared/custom-definitions';

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
