import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ResultFragment, SearchHitFragment } from '../../generated/graphql';
import { SearchParametersService } from '../search-parameters.service';
import { Filters } from '../search.service';
import { ResultCardStyle, ViewService } from '../view.service';

export type Hit = SearchHitFragment;

@Component({
    selector: 'app-search-results',
    templateUrl: './search-results.component.html',
    styleUrls: ['./search-results.component.scss'],
})
export class SearchResultsComponent implements OnInit, OnDestroy {
    @Input() results: ResultFragment;
    filters: Filters;

    private subscriptions: Subscription[] = [];

    constructor(private searchParameters: SearchParametersService, private view: ViewService) {}

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
