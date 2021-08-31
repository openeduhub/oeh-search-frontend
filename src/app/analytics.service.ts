import { Injectable } from '@angular/core';
import { empty, Observable, of, Subject } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
    LifecycleEvent,
    OpenAnalyticsSessionGQL,
    ReportLifecycleEventGQL,
    ReportResultClickGQL,
    ReportSearchRequestGQL,
} from 'src/generated/graphql';
import { ClickKind } from '../generated/graphql';
import { ConfigService } from './config.service';
import { ResultNode } from './edu-sharing/edu-sharing.service';
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
        private reportLifecycleEventGQL: ReportLifecycleEventGQL,
        private reportResultClickGQL: ReportResultClickGQL,
        private reportSearchRequestGQL: ReportSearchRequestGQL,
        private searchParameters: SearchParametersService,
        private view: ViewService,
    ) {
        // Use the beacon API where possible, but we need the response for openAnalyticsSession.
        openAnalyticsSessionGQL.client = 'analytics';
        reportLifecycleEventGQL.client = 'analyticsBeacon';
        reportResultClickGQL.client = 'analyticsBeacon';
        reportSearchRequestGQL.client = 'analyticsBeacon';
        if (environment.analyticsUrl) {
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
            this.registerLifecycleEventListeners();
        } else {
            this.sessionId = empty();
        }
    }

    reportSearchRequest(args: { numberResults: number }): void {
        if (environment.analyticsUrl) {
            this.sessionId
                .pipe(
                    switchMap((sessionId) =>
                        this.reportSearchRequestGQL.mutate({
                            ...this.searchRequestArgs,
                            sessionId,
                            ...this.getClientInformation(),
                            numberResults: args.numberResults,
                        }),
                    ),
                )
                .subscribe({
                    error: (err) => this.printError(err),
                });
        }
    }

    reportResultClick(args: { clickedResult: ResultNode; clickKind: ClickKind }): void {
        if (environment.analyticsUrl) {
            const filteredClickedResult = omitDeep(args.clickedResult, [
                '__typename',
                'previewImage',
                'description',
            ]);
            this.sessionId
                .pipe(
                    switchMap((sessionId) =>
                        this.reportResultClickGQL.mutate({
                            ...this.searchRequestArgs,
                            ...args,
                            ...this.getClientInformation(),
                            sessionId,
                            clickedResult: JSON.stringify(filteredClickedResult),
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
                    ...this.getClientInformation(),
                })
                .pipe(
                    map((response) => response.data.openSession),
                    tap((sessionId) =>
                        window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId),
                    ),
                );
        }
    }

    private registerLifecycleEventListeners(): void {
        const event$ = new Subject<{ event: LifecycleEvent; state: string }>();
        this.sessionId
            .pipe(
                switchMap((sessionId) =>
                    event$.pipe(
                        switchMap((lifecycleEvent) =>
                            this.reportLifecycleEventGQL.mutate({
                                ...lifecycleEvent,
                                sessionId,
                                ...this.getClientInformation(),
                            }),
                        ),
                    ),
                ),
            )
            .subscribe({
                error: (err) => this.printError(err),
            });

        const reportLifecycleEvent = (lifecycleEvent: { event: LifecycleEvent; state: string }) => {
            event$.next(lifecycleEvent);
        };

        window.addEventListener(
            'pagehide',
            (event) =>
                reportLifecycleEvent({
                    event: LifecycleEvent.Pagehide,
                    state: event.persisted ? 'frozen' : 'terminated',
                }),
            {
                capture: true,
            },
        );
        window.addEventListener(
            'visibilitychange',
            () =>
                reportLifecycleEvent({
                    event: LifecycleEvent.Visibilitychange,
                    state: document.visibilityState,
                }),
            {
                capture: true,
            },
        );
    }

    private getClientInformation() {
        return {
            userAgent: window.navigator.userAgent,
            screenWidth: screen.width,
            screenHeight: screen.height,
            language: this.config.getLanguage(),
        };
    }

    private printError(err: any): void {
        console.warn('Failed to report analytics data', err);
    }
}

/**
 * Makes a deep copy of `obj`, excluding all properties given in `excludedKeys` from `obj` and its
 * descendants.
 */
function omitDeep(obj: any, excludeKeys: string[]) {
    if (Array.isArray(obj)) {
        return obj.map((el) => omitDeep(el, excludeKeys));
    } else if (typeof obj === 'object' && obj !== null) {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            if (!excludeKeys.includes(key)) {
                acc[key] = omitDeep(value, excludeKeys);
            }
            return acc;
        }, {} as any);
    } else {
        return obj;
    }
}
