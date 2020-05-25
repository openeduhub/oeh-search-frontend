import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResultFragment, Thumbnail } from '../../generated/graphql';
import { Filters, SearchService } from '../search.service';
import { parseSearchQueryParams } from '../utils';

type Hits = ResultFragment['hits'];

@Component({
    selector: 'app-search-results',
    templateUrl: './search-results.component.html',
    styleUrls: ['./search-results.component.scss'],
})
export class SearchResultsComponent implements OnInit {
    @Input() hits: Hits;
    filters: Filters;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.queryParamMap.subscribe((queryParamMap) => {
            const { filters } = parseSearchQueryParams(queryParamMap);
            this.filters = filters;
        });
    }
}
