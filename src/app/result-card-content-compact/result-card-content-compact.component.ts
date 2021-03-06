import { Component, Input } from '@angular/core';
import { EditorialTag, Facet, Type } from '../../generated/graphql';
import { Hit } from '../search-results/search-results.component';
import { Filters } from '../search.service';

@Component({
    selector: 'app-result-card-content-compact',
    templateUrl: './result-card-content-compact.component.html',
    styleUrls: ['./result-card-content-compact.component.scss'],
})
export class ResultCardContentCompactComponent {
    @Input() hit: Hit;
    @Input() filters: Filters;

    readonly EditorialTag = EditorialTag;
    readonly Type = Type;
    readonly Facet = Facet;
    isExpanded = false;

    constructor() {}
}
