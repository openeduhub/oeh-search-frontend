import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DidYouMeanSuggestionFragment, ResultFragment } from '../../generated/graphql';
import { SearchParametersService } from '../search-parameters.service';
import { SearchData } from '../search-resolver.service';
import { SearchService } from '../search.service';
import { ResultCardStyle, ViewService } from '../view.service';

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
    selectedTab = new FormControl(0);
    resultCardStyle: ResultCardStyle;

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
        this.route.data.subscribe((data: { searchData: SearchData }) => {
            this.results = data.searchData.searchResults;
            // TODO: switch to tab 0 even if the user clicks on "show more" on the currently active
            // filter.
            this.selectedTab.setValue(0);
        });
        this.subscriptions.push(
            this.view
                .getResultCardStyle()
                .subscribe((resultCardStyle) => (this.resultCardStyle = resultCardStyle)),
        );
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    setResultCardStyle(resultCardStyle: ResultCardStyle) {
        this.view.setResultCardStyle(resultCardStyle);
    }
}
