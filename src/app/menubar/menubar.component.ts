import { Component } from '@angular/core';
import { BehaviorSubject, EMPTY, timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-menubar',
    templateUrl: './menubar.component.html',
    styleUrls: ['./menubar.component.scss'],
})
export class MenubarComponent {
    readonly wordpressUrl = environment.wordpressUrl;

    mobileMenuOpen: boolean;
    newsSubMenuOpen = new BehaviorSubject(false);

    private mouseOverNewsLink = new BehaviorSubject(false);
    private isTouchDevice: boolean;

    constructor() {
        this.isTouchDevice =
            // From https://stackoverflow.com/a/4819886
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0;
        if (!this.isTouchDevice) {
            this.mouseOverNewsLink
                .pipe(debounce((value) => (value ? EMPTY : timer(500))))
                .subscribe(this.newsSubMenuOpen);
        }
    }

    onMouseEnterNews(): void {
        this.mouseOverNewsLink.next(true);
    }

    onMouseLeaveNews(): void {
        this.mouseOverNewsLink.next(false);
    }

    onNewsLinkClicked(event: MouseEvent): void {
        if (this.isTouchDevice) {
            this.newsSubMenuOpen.next(!this.newsSubMenuOpen.value);
            event.preventDefault();
        }
    }
}
