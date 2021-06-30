import { Component, HostBinding, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ResultCardContentCompactComponent } from '../result-card-content-compact/result-card-content-compact.component';
import { ResultCardContentStandardComponent } from '../result-card-content-standard/result-card-content-standard.component';
import { Filters } from '../search.service';
import { Hit, ResultCardStyle, ViewService } from '../view.service';

@Component({
    selector: 'app-result-card',
    templateUrl: './result-card.component.html',
    styleUrls: ['./result-card.component.scss'],
})
export class ResultCardComponent implements OnInit, OnDestroy {
    @Input() hit: Hit;
    @Input() filters: Filters;
    @HostBinding('attr.data-style') style: ResultCardStyle;

    @ViewChild('cardContent', { static: true }) cardContent:
        | ResultCardContentStandardComponent
        | ResultCardContentCompactComponent;

    readonly selectedItem$ = this.view.getSelectedItem();

    private subscriptions: Subscription[] = [];

    constructor(private view: ViewService) {}

    ngOnInit(): void {
        this.subscriptions.push(
            this.view
                .getResultCardStyle()
                .subscribe((resultCardStyle) => (this.style = resultCardStyle)),
        );
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }
}
