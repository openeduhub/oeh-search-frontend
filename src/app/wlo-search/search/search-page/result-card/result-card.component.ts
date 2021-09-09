import { Component, HostBinding, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ResultCardStyle, ViewService } from '../../../core/view.service';
import { Filters, ResultNode } from '../../../core/edu-sharing.service';
import { ResultCardContentCompactComponent } from '../result-card-content-compact/result-card-content-compact.component';
import { ResultCardContentStandardComponent } from '../result-card-content-standard/result-card-content-standard.component';

@Component({
    selector: 'app-result-card',
    templateUrl: './result-card.component.html',
    styleUrls: ['./result-card.component.scss'],
})
export class ResultCardComponent implements OnInit, OnDestroy {
    @Input() hit: ResultNode;
    @Input() filters: Filters;
    @HostBinding('attr.data-style') style: ResultCardStyle;

    @ViewChild('cardContent', { static: true }) cardContent:
        | ResultCardContentStandardComponent
        | ResultCardContentCompactComponent;

    readonly selectedItem$ = this.view.getSelectedItem();

    private readonly destroyed$ = new ReplaySubject<void>(1);

    constructor(private view: ViewService) {}

    ngOnInit(): void {
        this.view
            .getResultCardStyle()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((resultCardStyle) => (this.style = resultCardStyle));
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
