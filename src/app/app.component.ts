import { ViewportScroller } from '@angular/common';
import { Component, DoCheck, NgZone } from '@angular/core';
import {
    NavigationCancel,
    NavigationEnd,
    NavigationError,
    NavigationStart,
    Router,
    Scroll,
} from '@angular/router';
import { delay, filter } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ErrorService } from './error.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements DoCheck {
    private static readonly CHECKS_PER_SECOND_WARNING_THRESHOLD = 0;
    private static readonly CONSECUTIVE_TRANSGRESSION_THRESHOLD = 10;

    loading = false;
    private numberOfChecks = 0;
    private consecutiveTransgression = 0;
    private checksMonitorInterval: number;

    constructor(
        router: Router,
        viewportScroller: ViewportScroller,
        error: ErrorService,
        auth: AuthService,
        ngZone: NgZone,
    ) {
        ngZone.runOutsideAngular(() => {
            this.checksMonitorInterval = window.setInterval(() => this.monitorChecks(), 1000);
        });
        // Bootstrap login via OpenID.
        // auth.bootstrap();
        // Recreate scroll restoration behavior of the scrollPositionRestoration option (see
        // https://angular.io/api/router/ExtraOptions#scrollPositionRestoration) with added delay.
        router.events
            .pipe(
                filter((e): e is Scroll => e instanceof Scroll),
                delay(0), // Wait for data to be rendered.
            )
            .subscribe((e) => {
                if (e.position) {
                    viewportScroller.scrollToPosition(e.position);
                } else if (e.anchor) {
                    viewportScroller.scrollToAnchor(e.anchor);
                } else {
                    viewportScroller.scrollToPosition([0, 0]);
                }
            });
        // Catch navigation errors. These happen when a resolver throws an error.
        router.events
            .pipe(filter((e): e is NavigationError => e instanceof NavigationError))
            .subscribe((e) => {
                error.goToErrorPage(e);
            });
        // Enable / disable the loading spinner.
        router.events
            .pipe(filter((e) => e instanceof NavigationStart))
            .subscribe(() => (this.loading = true));
        router.events
            .pipe(
                filter(
                    (e) =>
                        e instanceof NavigationEnd ||
                        e instanceof NavigationCancel ||
                        e instanceof NavigationError,
                ),
            )
            .subscribe(() => (this.loading = false));
    }

    ngDoCheck(): void {
        this.numberOfChecks++;
    }

    private monitorChecks(): void {
        // console.log('Change detections run in the past second:', this.numberOfChecks);
        if (this.numberOfChecks > AppComponent.CHECKS_PER_SECOND_WARNING_THRESHOLD) {
            this.consecutiveTransgression++;
            if (this.consecutiveTransgression >= AppComponent.CONSECUTIVE_TRANSGRESSION_THRESHOLD) {
                console.warn(
                    'Change detection triggered more than ' +
                        AppComponent.CHECKS_PER_SECOND_WARNING_THRESHOLD +
                        ' times per second for the past ' +
                        AppComponent.CONSECUTIVE_TRANSGRESSION_THRESHOLD +
                        ' seconds consecutively.' +
                        ' Not showing any more warnings.',
                );
                window.clearInterval(this.checksMonitorInterval);
            }
        } else {
            this.consecutiveTransgression = 0;
        }
        this.numberOfChecks = 0;
    }
}
