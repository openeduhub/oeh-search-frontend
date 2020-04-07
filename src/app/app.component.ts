import { Component } from '@angular/core';
import { Router, Scroll } from '@angular/router';
import { filter, delay } from 'rxjs/operators';
import { ViewportScroller } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(private router: Router, private viewportScroller: ViewportScroller) {
        // Recreate scroll restoration behavior of the scrollPositionRestoration option (see
        // https://angular.io/api/router/ExtraOptions#scrollPositionRestoration) with added delay.
        this.router.events
            .pipe(
                filter((e: any): e is Scroll => e instanceof Scroll),
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
}
