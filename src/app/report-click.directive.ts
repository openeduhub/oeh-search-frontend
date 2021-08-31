import { Directive, HostListener, Input } from '@angular/core';
import { ClickKind } from 'src/generated/graphql';
import { AnalyticsService } from './analytics.service';
import { ResultNode } from './edu-sharing/edu-sharing.service';

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
