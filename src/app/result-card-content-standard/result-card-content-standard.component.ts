import { Component, Input } from '@angular/core';
import { EditorialTag, Facet, Type } from '../../generated/graphql';
import { Hit } from '../search-results/search-results.component';
import { Filters } from '../search.service';

@Component({
    selector: 'app-result-card-content-standard',
    templateUrl: './result-card-content-standard.component.html',
    styleUrls: ['./result-card-content-standard.component.scss'],
})
export class ResultCardContentStandardComponent {
    @Input() hit: Hit;
    @Input() filters: Filters;

    readonly EditorialTag = EditorialTag;
    readonly Type = Type;
    readonly Facet = Facet;
    thumbnail: string;

    constructor() {}
}
