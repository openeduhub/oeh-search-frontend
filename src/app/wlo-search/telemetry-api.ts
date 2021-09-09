import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Language } from './core/config.service';

export const TELEMETRY_API = new InjectionToken<TelemetryApi>('TELEMETRY_API');

export enum ClickKind {
    Click = 'click',
    MiddleClick = 'middleClick',
    Contextmenu = 'contextmenu',
}

export enum LifecycleEvent {
    Visibilitychange = 'visibilitychange',
    Pagehide = 'pagehide',
}

/**
 * An abstract service interface for telemetry reporting.
 *
 * Using an interface allows the application to use a GraphQL API without introducing dependencies
 * to the wlo-search module.
 */
export interface TelemetryApi {
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
    }): Observable<void>;

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
    }): Observable<void>;

    openAnalyticsSession(args: {
        userAgent: string;
        screenWidth: number;
        screenHeight: number;
        language: Language;
    }): Observable<string>;

    reportLifecycleEvent(args: {
        userAgent: string;
        screenWidth: number;
        screenHeight: number;
        sessionId: string;
        event: LifecycleEvent;
        state: string;
        language: Language;
    }): Observable<void>;
}
