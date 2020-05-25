import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DidYouMeanSuggestionFragment, ResultFragment } from '../../generated/graphql';
import { SearchService } from '../search.service';
import { parseSearchQueryParams } from '../utils';
import { ViewService } from '../view.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
    didYouMeanSuggestion: DidYouMeanSuggestionFragment;
    showFilterBar = false;
    filterCount: number;
    pageIndex: number;
    results: ResultFragment;

    private subscriptions: Subscription[] = [];

    constructor(
        private route: ActivatedRoute,
        private search: SearchService,
        private view: ViewService,
    ) {}

    ngOnInit(): void {
        this.subscriptions.push(
            this.search
                .getDidYouMeanSuggestion()
                .subscribe(
                    (didYouMeanSuggestion) => (this.didYouMeanSuggestion = didYouMeanSuggestion),
                ),
        );
        this.subscriptions.push(
            this.view.getShowFilterBar().subscribe((value) => {
                this.showFilterBar = value;
            }),
        );
        this.subscriptions.push(
            this.route.queryParamMap.subscribe((queryParamMap) => {
                const { pageIndex, filters } = parseSearchQueryParams(queryParamMap);
                this.pageIndex = pageIndex;
                this.filterCount = Object.keys(filters).filter((k) => filters[k]?.length).length;
            }),
        );
        this.route.data.subscribe((data: { results: ResultFragment }) => {
            this.results = data.results;
        });
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }
}
