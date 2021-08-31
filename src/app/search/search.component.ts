import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AnalyticsService } from '../analytics.service';
import {
    DidYouMeanSuggestion,
    EduSharingService,
    SearchResults,
} from '../edu-sharing/edu-sharing.service';
import { PageModeService } from '../page-mode.service';
import { SearchParametersService } from '../search-parameters.service';
import { SearchResultsService } from '../search-results/search-results.service';
import { ResultCardStyle, ViewService } from '../view.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
    didYouMeanSuggestion: DidYouMeanSuggestion;
    showFilterBar = false;
    filterCount: number;
    pageIndex: number;
    results: SearchResults;
    selectedTab = new FormControl(0);
    resultCardStyle: ResultCardStyle;
    resultPageNumbers: { from: number; to: number };
    readonly searchResultsStyle$ = this.pageMode.getPageConfig('searchResultsStyle');
    readonly wordpressUrl = environment.wordpressUrl;

    private subscriptions: Subscription[] = [];

    constructor(
        private analyticsService: AnalyticsService,
        private pageMode: PageModeService,
        private route: ActivatedRoute,
        private eduSharing: EduSharingService,
        private searchParameters: SearchParametersService,
        private searchResults: SearchResultsService,
        private view: ViewService,
    ) {}

    ngOnInit(): void {
        this.subscriptions.push(
            this.eduSharing
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
                if (this.results) {
                    this.resultPageNumbers = this.getResultPageNumbers();
                }
            }),
        );
        this.route.data.subscribe((data: { searchData: SearchResults }) => {
            this.results = data.searchData;
            this.searchResults.results.next(this.results);
            this.resultPageNumbers = this.getResultPageNumbers();
            this.analyticsService.reportSearchRequest({
                numberResults: this.results.pagination.total,
            });
            // TODO: switch to tab 0 even if the user clicks on "show more" on the currently active
            // filter.
            this.view.searchTabSubject.next(0);
        });
        this.subscriptions.push(
            this.view
                .getResultCardStyle()
                .subscribe((resultCardStyle) => (this.resultCardStyle = resultCardStyle)),
        );
        this.subscriptions.push(
            this.view.searchTabSubject.subscribe((searchTab) =>
                this.selectedTab.setValue(searchTab),
            ),
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

    onSelectedIndexChange(selectedTabIndex: number): void {
        this.view.searchTabSubject.next(selectedTabIndex);
    }

    private getResultPageNumbers(): { from: number; to: number } {
        return {
            from: this.pageIndex * 12 + 1,
            to: this.pageIndex * 12 + this.results.nodes.length,
        };
    }
}
