import { Directive, HostListener, Input } from '@angular/core';
import { AnalyticsService } from '../core/analytics.service';
import { ResultNode } from '../core/edu-sharing.service';
import { ClickKind } from '../telemetry-api';

@Directive({
    selector: '[appReportClick]',
})
export class ReportClickDirective {
    @Input('appReportClick') hit: ResultNode;

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
