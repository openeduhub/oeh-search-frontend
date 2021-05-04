import { Directive, HostListener, Input } from '@angular/core';
import { ClickKind } from 'src/generated/graphql';
import { AnalyticsService } from './analytics.service';
import { Hit } from './search-results/search-results.component';

@Directive({
    selector: '[appReportClick]',
})
export class ReportClickDirective {
    @Input('appReportClick') hit: Hit;

    constructor(private analytics: AnalyticsService) {}

    @HostListener('click')
    onClick() {
        this.analytics.reportResultClick({
            clickedResult: this.hit,
            clickKind: ClickKind.Click,
        });
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent) {
        if (event.button === 1) {
            this.analytics.reportResultClick({
                clickedResult: this.hit,
                clickKind: ClickKind.MiddleClick,
            });
        }
    }

    @HostListener('contextmenu')
    onContextmenu() {
        this.analytics.reportResultClick({
            clickedResult: this.hit,
            clickKind: ClickKind.Contextmenu,
        });
    }
}
