import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { ResultCardStyle } from './view.service';

type PageMode = 'default' | 'portlet';

/**
 * Available properties with their default values.
 */
export class PageConfig {
    /** The compact style combines the Wordpress menu bar with our header bar. */
    headerStyle: 'standard' | 'compact' = 'standard';
    /** The compact style removes the tab navigation. */
    searchResultsStyle: 'standard' | 'compact' = 'standard';
    /** Override the user-selectable style for result cards. */
    forceResultCardStyle?: ResultCardStyle;
    /** The compact style removes most links, 'none' removes the entire footer. */
    footerStyle: 'standard' | 'compact' | 'none' = 'standard';
    /** Page body background becomes transparent. */
    transparentBackground: boolean = false;
    /** Number of search results per page. */
    numberOfResults: number = 12;
    /** An additional button in the details view to trigger an iFrame message. */
    showEmbedButton: boolean = false;
}

/**
 * Available modes and their overrides.
 *
 * Leave any property undefined to use the default value for that mode.
 */
const pageModes: { [mode in PageMode]: Partial<PageConfig> } = {
    default: {}, // All values default.
    portlet: {
        headerStyle: 'compact',
        searchResultsStyle: 'compact',
        forceResultCardStyle: 'standard',
        footerStyle: 'none',
        transparentBackground: true,
        numberOfResults: 4,
    },
};

@Injectable({
    providedIn: 'root',
})
export class PageModeService {
    private readonly pageModeSubject = new BehaviorSubject<PageMode>('default');
    private readonly pageConfigSubject = new BehaviorSubject<PageConfig>(null);

    constructor(private router: Router) {
        // Get the `pageMode` query parameter through router events to get the parameter before the
        // route resolves.
        this.router.events
            .pipe(
                filter((e): e is NavigationStart => e instanceof NavigationStart),
                map((event) => event.url),
                filter((url) => url.includes('?')),
                map((url) => url.slice(url.indexOf('?'))),
                map((searchParams) => new URLSearchParams(searchParams).get('pageMode')),
                distinctUntilChanged(),
            )
            .subscribe((pageMode) => {
                if (pageMode) {
                    this.pageModeSubject.next(pageMode as PageMode);
                }
            });
        this.pageModeSubject.pipe(distinctUntilChanged()).subscribe((pageMode) => {
            const pageConfig = pageModes[pageMode];
            if (pageConfig) {
                this.pageConfigSubject.next({ ...new PageConfig(), ...pageConfig });
            } else {
                console.error(`Unknown page mode "${pageMode}"`);
            }
        });
    }

    getPageConfig<P extends keyof PageConfig>(property: P): Observable<PageConfig[P]> {
        return this.pageConfigSubject.pipe(
            filter((pageConfig) => pageConfig !== null),
            map((pageConfig) => pageConfig[property]),
            distinctUntilChanged(),
        );
    }
}
