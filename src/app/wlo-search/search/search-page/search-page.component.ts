import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ConfigService } from '../../core/config.service';
import {
    DidYouMeanSuggestion,
    EduSharingService,
    Facet,
    SearchResults,
} from '../../core/edu-sharing.service';
import { PageModeService } from '../../core/page-mode.service';
import { ResolveService } from '../../core/resolve.service';
import { SearchParametersService } from '../../core/search-parameters.service';
import { ResultCardStyle, ViewService } from '../../core/view.service';
import { AnalyticsService } from '../../core/analytics.service';
import { SearchPageResolverService } from './search-page-resolver.service';
import { SearchResultsService } from './search-results/search-results.service';

@Component({
    selector: 'app-search',
    templateUrl: './search-page.component.html',
    styleUrls: ['./search-page.component.scss'],
})
export class SearchPageComponent implements OnInit, OnDestroy {
    readonly routerPath = this.config.get().routerPath;

    didYouMeanSuggestion: DidYouMeanSuggestion;
    showFilterBar = false;
    filterCount: number;
    pageIndex: number;
    results: SearchResults;
    selectedTab = new FormControl(0);
    resultCardStyle: ResultCardStyle;
    resultPageNumbers: { from: number; to: number };
    readonly searchResultsStyle$ = this.pageMode.getPageConfig('searchResultsStyle');
    readonly wordpressUrl = this.config.get().wordpressUrl;

    private subscriptions: Subscription[] = [];
    private readonly destroyed$ = new Subject<void>();

    constructor(
        private analyticsService: AnalyticsService,
        private config: ConfigService,
        private eduSharing: EduSharingService,
        private pageMode: PageModeService,
        private resolve: ResolveService,
        private resolver: SearchPageResolverService,
        private route: ActivatedRoute,
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
        this.searchParameters
            .get()
            .pipe(
                takeUntil(this.destroyed$),
                filter((params) => params !== null),
            )
            .subscribe(({ pageIndex, filters }) => {
                this.pageIndex = pageIndex;
                this.filterCount = Object.keys(filters).filter(
                    (k) => filters[k as Facet]?.length,
                ).length;
                if (this.results) {
                    this.resultPageNumbers = this.getResultPageNumbers();
                }
            }),
            // this.route.data.subscribe((data: { searchData: SearchResults }) => {
            //     this.results = data.searchData;
            this.resolve
                .resolve(this.resolver, this.route)
                .pipe(takeUntil(this.destroyed$))
                .subscribe((results) => {
                    this.results = results;
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
        this.destroyed$.next();
        this.destroyed$.complete();
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
