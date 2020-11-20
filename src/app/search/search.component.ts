import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DidYouMeanSuggestionFragment, ResultFragment } from '../../generated/graphql';
import { SearchParametersService } from '../search-parameters.service';
import { SearchData } from '../search-resolver.service';
import { SearchService } from '../search.service';
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
    breadcrumbs: string[];

    private subscriptions: Subscription[] = [];

    constructor(
        private route: ActivatedRoute,
        private search: SearchService,
        private searchParameters: SearchParametersService,
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
            this.searchParameters.get().subscribe(({ pageIndex, filters }) => {
                this.pageIndex = pageIndex;
                this.filterCount = Object.keys(filters).filter((k) => filters[k]?.length).length;
            }),
        );
        this.subscriptions.push(
            this.route.paramMap.subscribe((paramMap) => {
                if (paramMap.has('educationalContext') && paramMap.has('discipline')) {
                    this.breadcrumbs = [
                        paramMap.get('educationalContext'),
                        paramMap.get('discipline'),
                    ];
                }
            }),
        );
        this.route.data.subscribe((data: { searchData: SearchData }) => {
            this.results = data.searchData.searchResults;
        });
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }
}
