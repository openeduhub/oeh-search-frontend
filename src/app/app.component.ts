import { Component } from '@angular/core';
import { Router, Scroll, NavigationError } from '@angular/router';
import { filter, delay } from 'rxjs/operators';
import { ViewportScroller } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(router: Router, viewportScroller: ViewportScroller) {
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
            .subscribe((error) => {
                console.log(error);
                router.navigate(['/error'], {
                    queryParams: {
                        url: error.url,
                        name: error.error.constructor.name,
                        error: JSON.stringify(error.error),
                    },
                });
            });
    }
}
