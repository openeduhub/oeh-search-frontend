import { Component } from '@angular/core';
import { Router, Scroll, NavigationError } from '@angular/router';
import { filter, delay } from 'rxjs/operators';
import { ViewportScroller } from '@angular/common';
import { ErrorService } from './error.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(router: Router, viewportScroller: ViewportScroller, error: ErrorService) {
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
    }
}
