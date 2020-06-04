import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ResultFragment } from '../../generated/graphql';
import { SearchParametersService } from '../search-parameters.service';
import { Filters } from '../search.service';

type Hits = ResultFragment['hits'];

@Component({
    selector: 'app-search-results',
    templateUrl: './search-results.component.html',
    styleUrls: ['./search-results.component.scss'],
})
export class SearchResultsComponent implements OnInit, OnDestroy {
    @Input() hits: Hits;
    filters: Filters;

    private subscriptions: Subscription[] = [];

    constructor(private searchParameters: SearchParametersService) {}

    ngOnInit(): void {
        this.subscriptions.push(
            this.searchParameters.get().subscribe(({ filters }) => {
                this.filters = filters;
            }),
        );
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }
}
