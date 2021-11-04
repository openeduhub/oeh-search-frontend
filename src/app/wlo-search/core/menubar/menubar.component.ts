import { Component } from '@angular/core';
import { BehaviorSubject, EMPTY, timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { ConfigService } from '../config.service';
import { SkipNavService, SkipTarget } from '../skip-nav/skip-nav.service';

@Component({
    selector: 'app-menubar',
    templateUrl: './menubar.component.html',
    styleUrls: ['./menubar.component.scss'],
})
export class MenubarComponent {
    readonly routerPath = this.config.get().routerPath;
    readonly wordpressUrl = this.config.get().wordpressUrl;

    mobileMenuOpen: boolean;
    newsSubMenuOpen = new BehaviorSubject(false);

    private mouseOverNewsLink = new BehaviorSubject(false);
    private isTouchDevice: boolean;

    constructor(private config: ConfigService, private skipNav: SkipNavService) {
        this.isTouchDevice =
            // From https://stackoverflow.com/a/4819886
            'ontouchstart' in window || navigator.maxTouchPoints > 0;
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

    skipTo(target: SkipTarget): void {
        this.skipNav.skipTo(target);
    }
}
