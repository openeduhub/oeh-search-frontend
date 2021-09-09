import { ViewportScroller } from '@angular/common';
import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import {
    NavigationCancel,
    NavigationEnd,
    NavigationError,
    NavigationStart,
    Router,
    Scroll,
} from '@angular/router';
import { Subject } from 'rxjs';
import { delay, filter, takeUntil } from 'rxjs/operators';
import { ConfigService } from './core/config.service';
import { CoreService } from './core/core.service';
import { ErrorService } from './core/error-page/error.service';
import { PageModeService } from './core/page-mode.service';
import { ViewService } from './core/view.service';
@Component({
    selector: 'app-wlo-search',
    templateUrl: './wlo-search.component.html',
    styleUrls: ['./wlo-search.component.scss'],
})
export class WloSearchComponent implements OnInit, OnDestroy {
    readonly headerStyle$ = this.pageMode.getPageConfig('headerStyle');
    readonly isLoading$ = this.view.getIsLoading();
    private readonly destroyed$ = new Subject<void>();

    constructor(
        private router: Router,
        private viewportScroller: ViewportScroller,
        private error: ErrorService,
        private pageMode: PageModeService,
        private renderer: Renderer2,
        private view: ViewService,
        private core: CoreService,
        private config: ConfigService,
    ) {}

    ngOnInit(): void {
        this.core.setUp();
        this.registerScrollRestoration();
        this.registerErrorPage();
        this.registerLoadingSpinner();
        this.registerTransparentBackground();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    private registerScrollRestoration(): void {
        // Recreate scroll restoration behavior of the scrollPositionRestoration option (see
        // https://angular.io/api/router/ExtraOptions#scrollPositionRestoration) with added delay.
        this.router.events
            .pipe(
                takeUntil(this.destroyed$),
                filter((e): e is Scroll => e instanceof Scroll),
                delay(0), // Wait for data to be rendered.
            )
            .subscribe((e) => {
                if (e.position) {
                    this.viewportScroller.scrollToPosition(e.position);
                } else if (e.anchor) {
                    this.viewportScroller.scrollToAnchor(e.anchor);
                } else {
                    this.viewportScroller.scrollToPosition([0, 0]);
                }
            });
    }

    private registerErrorPage(): void {
        // Catch navigation errors. These happen when a resolver throws an error.
        this.router.events
            .pipe(
                takeUntil(this.destroyed$),
                filter((e): e is NavigationError => e instanceof NavigationError),
            )
            .subscribe((e) => {
                this.error.goToErrorPage(e);
            });
    }

    private registerLoadingSpinner(): void {
        this.router.events
            .pipe(
                takeUntil(this.destroyed$),
                filter((e): e is NavigationStart => e instanceof NavigationStart),
                // Don't set isLoading when navigating away entirely since we won't see the
                // `NavigationEnd` event.
                filter((e) => e.url.startsWith(this.config.get().routerPath)),
            )
            .subscribe(() => this.view.setIsLoading());
        this.router.events
            .pipe(
                takeUntil(this.destroyed$),
                filter(
                    (e) =>
                        e instanceof NavigationEnd ||
                        e instanceof NavigationCancel ||
                        e instanceof NavigationError,
                ),
            )
            .subscribe(() => this.view.unsetIsLoading());
    }

    private registerTransparentBackground(): void {
        this.pageMode
            .getPageConfig('transparentBackground')
            .pipe(takeUntil(this.destroyed$))
            .subscribe((transparentBackground) => {
                if (transparentBackground) {
                    this.renderer.setStyle(document.body, 'background-color', 'transparent');
                } else {
                    this.renderer.removeStyle(document.body, 'background-color');
                }
            });
    }
}
