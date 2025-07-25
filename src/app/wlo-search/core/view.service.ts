import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { NavigationStart, NavigationEnd, Router } from '@angular/router';
import { Node } from 'ngx-edu-sharing-api';
import * as rxjs from 'rxjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, skip } from 'rxjs/operators';
import { PageModeService } from './page-mode.service';

export type ResultCardStyle = 'standard' | 'compact';

@Injectable({
    providedIn: 'root',
})
export class ViewService {
    readonly previewPanelMode$: Observable<'dialog' | 'sidebar'> = this.breakpointObserver
        .observe('(min-width: 1210px)') // Smallest width still supporting two card columns
        .pipe(
            map((result) => (result.matches ? 'sidebar' : 'dialog')),
            shareReplay<'dialog' | 'sidebar'>(),
        );
    readonly searchTabSubject = new BehaviorSubject<number>(0);

    private readonly isLoadingCounter = new BehaviorSubject<number>(0);
    private showFilterBarSubject: BehaviorSubject<boolean>;
    private resultCardStyleSubject: BehaviorSubject<ResultCardStyle>;
    /**
     * When an item is selected, it is highlighted and depending on the screen size, previewed in a
     * sidebar or a dialog. Unselecting the item means closing the preview.
     */
    private selectedItemSubject = new BehaviorSubject<Node | null>(null);
    private showPreviewPanel$ = this.selectedItemSubject.pipe(
        map((item) => !!item),
        distinctUntilChanged(),
    );

    constructor(
        private breakpointObserver: BreakpointObserver,
        private pageMode: PageModeService,
        private router: Router,
    ) {
        // reference: https://stackoverflow.com/a/52697630
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd): void => {
                this.isTemplate.next(event.url?.includes('/template') ?? false);
            });
        this.registerStoredItems();
        this.registerBehaviorHooks();
    }

    private registerStoredItems(): void {
        const isMobile = screen.width < 600 || screen.height < 600;
        // Persistent during session
        this.showFilterBarSubject = new BehaviorSubject(
            sessionStorage.getItem('showFilterBar') === 'true',
        );
        // Persistent
        this.resultCardStyleSubject = new BehaviorSubject(
            (localStorage.getItem('resultCardStyle') as ResultCardStyle) ||
                (isMobile ? 'compact' : 'standard'),
        );
    }

    private registerBehaviorHooks(): void {
        // Filter bar and preview panel are mutually exclusive.
        this.showFilterBarSubject
            .pipe(filter((showFilterBar) => showFilterBar))
            .subscribe(() => this.selectedItemSubject.next(null));
        rxjs.combineLatest([this.showPreviewPanel$, this.previewPanelMode$])
            .pipe(
                filter(
                    ([showPreviewPanel, previewPanelMode]) =>
                        showPreviewPanel && previewPanelMode === 'sidebar',
                ),
            )
            .subscribe(() => this.showFilterBarSubject.next(false));

        // Close preview panel on page navigation.
        rxjs.merge(
            this.router.events.pipe(filter((event) => event instanceof NavigationStart)),
            this.searchTabSubject.pipe(skip(1)),
        ).subscribe(() => this.selectItem(null));
    }

    getShowFilterBar(): Observable<boolean> {
        return this.showFilterBarSubject.asObservable();
    }

    toggleShowFilterBar() {
        this.setShowFilterBar(!this.showFilterBarSubject.value);
    }

    setShowFilterBar(value: boolean) {
        this.showFilterBarSubject.next(value);
        sessionStorage.setItem('showFilterBar', value.toString());
    }

    getResultCardStyle(): Observable<ResultCardStyle> {
        return rxjs
            .combineLatest([
                this.resultCardStyleSubject,
                this.pageMode.getPageConfig('forceResultCardStyle'),
            ])
            .pipe(
                map(
                    ([resultCardStyle, forceResultCardStyle]) =>
                        forceResultCardStyle ?? resultCardStyle,
                ),
            );
    }

    setResultCardStyle(value: ResultCardStyle) {
        this.resultCardStyleSubject.next(value);
        localStorage.setItem('resultCardStyle', value);
    }

    selectItem(item: Node): void {
        this.selectedItemSubject.next(item);
    }

    unselectItem(): void {
        this.selectedItemSubject.next(null);
    }

    getSelectedItem(): Observable<Node | null> {
        return this.selectedItemSubject.asObservable();
    }

    panelsChange(): Observable<void> {
        return rxjs
            .merge(
                // Skip replays.
                this.showPreviewPanel$.pipe(skip(1)),
                this.showFilterBarSubject.pipe(skip(1)),
            )
            .pipe(map(() => {}));
    }

    setIsLoading(): void {
        this.isLoadingCounter.next(this.isLoadingCounter.value + 1);
    }

    /** Call exactly once for each call to `setIsLoading`. */
    unsetIsLoading(): void {
        if (this.isLoadingCounter.value === 0) {
            throw new Error('Called `unsetIsLoading` when not loading.');
        }
        this.isLoadingCounter.next(this.isLoadingCounter.value - 1);
    }

    getIsLoading(): Observable<boolean> {
        return this.isLoadingCounter.pipe(map((counter) => counter > 0));
    }

    isTemplate = new BehaviorSubject<boolean>(false);
}
