import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    OpenAnalyticsSessionGQL,
    ReportLifecycleEventGQL,
    ReportResultClickGQL,
    ReportSearchRequestGQL,
} from 'src/generated/graphql';
import { Language } from './wlo-search/core/config.service';
import { ClickKind, LifecycleEvent, TelemetryApi } from './wlo-search/telemetry-api';

export class TelemetryApiWrapper implements TelemetryApi {
    constructor(
        private openAnalyticsSessionGQL: OpenAnalyticsSessionGQL,
        private reportLifecycleEventGQL: ReportLifecycleEventGQL,
        private reportResultClickGQL: ReportResultClickGQL,
        private reportSearchRequestGQL: ReportSearchRequestGQL,
    ) {
        // Use the beacon API where possible, but we need the response for openAnalyticsSession.
        openAnalyticsSessionGQL.client = 'analytics';
        reportLifecycleEventGQL.client = 'analyticsBeacon';
        reportResultClickGQL.client = 'analyticsBeacon';
        reportSearchRequestGQL.client = 'analyticsBeacon';
    }

    reportSearchRequest(args: {
        userAgent: string;
        screenWidth: number;
        screenHeight: number;
        sessionId: string;
        searchString: string;
        page: number;
        filters: string;
        filtersSidebarIsVisible: boolean;
        language: Language;
        numberResults: number;
    }): Observable<void> {
        return this.reportSearchRequestGQL.mutate(args).pipe(map(() => {}));
    }

    reportResultClick(args: {
        userAgent: string;
        screenWidth: number;
        screenHeight: number;
        sessionId: string;
        searchString: string;
        page: number;
        filters: string;
        filtersSidebarIsVisible: boolean;
        language: Language;
        clickedResult: string;
        clickKind: ClickKind;
    }): Observable<void> {
        return this.reportResultClickGQL.mutate(args).pipe(map(() => {}));
    }

    openAnalyticsSession(args: {
        userAgent: string;
        screenWidth: number;
        screenHeight: number;
        language: Language;
    }): Observable<string> {
        return this.openAnalyticsSessionGQL
            .mutate(args)
            .pipe(map((response) => response.data.openSession));
    }

    reportLifecycleEvent(args: {
        userAgent: string;
        screenWidth: number;
        screenHeight: number;
        sessionId: string;
        event: LifecycleEvent;
        state: string;
        language: Language;
    }): Observable<void> {
        return this.reportLifecycleEventGQL.mutate(args).pipe(map(() => {}));
    }
}
