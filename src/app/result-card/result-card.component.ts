import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ResultFragment } from '../../generated/graphql';
import { Filters } from '../search.service';
import { Unpacked } from '../utils';
import { ResultCardStyle, ViewService } from '../view.service';

type Hits = ResultFragment['hits']['hits'];
export type Hit = Unpacked<Hits>;

@Component({
    selector: 'app-result-card',
    templateUrl: './result-card.component.html',
    styleUrls: ['./result-card.component.scss'],
})
export class ResultCardComponent implements OnInit, OnDestroy {
    @Input() result: Hit;
    @Input() filters: Filters;
    style: ResultCardStyle;

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
