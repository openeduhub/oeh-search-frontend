import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
    OpenAnalyticsSessionGQL,
    ReportResultClickGQL,
    ReportSearchRequestGQL,
} from 'src/generated/graphql';
import { ClickKind } from '../generated/graphql';
import { ConfigService } from './config.service';
import { SearchParametersService } from './search-parameters.service';
import { ViewService } from './view.service';

const SESSION_STORAGE_KEY = 'analytics-session-id';

interface SearchRequestArgs {
    searchString: string;
    page: number;
    filters: string;
    filtersSidebarIsVisible: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class AnalyticsService {
    private sessionId: Observable<string>;

    // We keep track of the current search request arguments and assume that these were used for
    // requests when we receive results. This is not an entirely clean solution, but should work.
    private searchRequestArgs: SearchRequestArgs = {
        searchString: '',
        page: 0,
        filters: '{}',
        filtersSidebarIsVisible: false,
    };

    constructor(
        private config: ConfigService,
        private openAnalyticsSessionGQL: OpenAnalyticsSessionGQL,
        private reportResultClickGQL: ReportResultClickGQL,
        private reportSearchRequestGQL: ReportSearchRequestGQL,
        private searchParameters: SearchParametersService,
        private view: ViewService,
    ) {
        openAnalyticsSessionGQL.client = 'analytics';
        reportResultClickGQL.client = 'analytics';
        reportSearchRequestGQL.client = 'analytics';
        this.sessionId = this.getSessionId().pipe(shareReplay());
        this.sessionId.subscribe();
        this.view.getShowFilterBar().subscribe((value) => {
            this.searchRequestArgs.filtersSidebarIsVisible = value;
        });
        this.searchParameters.get().subscribe(({ searchString, pageIndex: page, filters }) => {
            this.searchRequestArgs = {
                ...this.searchRequestArgs,
                searchString,
                page,
                filters: JSON.stringify(filters),
            };
        });
    }

    reportSearchRequest(args: { numberResults: number }): void {
        if (environment.analyticsUrl) {
            this.sessionId
                .pipe(
                    switchMap((sessionId) =>
                        this.reportSearchRequestGQL.mutate({
                            ...this.searchRequestArgs,
                            sessionId,
                            screenWidth: screen.width,
                            screenHeight: screen.height,
                            language: this.config.getLanguage(),
                            numberResults: args.numberResults,
                        }),
                    ),
                )
                .subscribe({
                    error: (err) => this.printError(err),
                });
        }
    }

    reportResultClick(args: { clickedResultId: string; clickKind: ClickKind }): void {
        if (environment.analyticsUrl) {
            this.sessionId
                .pipe(
                    switchMap((sessionId) =>
                        this.reportResultClickGQL.mutate({
                            ...this.searchRequestArgs,
                            ...args,
                            sessionId,
                            screenWidth: screen.width,
                            screenHeight: screen.height,
                            language: this.config.getLanguage(),
                        }),
                    ),
                )
                .subscribe({
                    error: (err) => this.printError(err),
                });
        }
    }

    /**
     * Read the analytics session ID from session storage or request a new one if none is found.
     */
    private getSessionId(): Observable<string> {
        const storedSessionId = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (storedSessionId) {
            return of(storedSessionId);
        } else {
            return this.openAnalyticsSessionGQL
                .mutate({
                    screenWidth: screen.width,
                    screenHeight: screen.height,
                })
                .pipe(
                    map((response) => response.data.openSession),
                    tap((sessionId) =>
                        window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId),
                    ),
                );
        }
    }

    private printError(err: any): void {
        console.warn('Failed to report analytics data', err);
    }
}
