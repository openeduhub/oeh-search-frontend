import { Component, Input, ViewChild } from '@angular/core';
import { ViewService } from '../../../core/view.service';
import { Filters, ResultNode } from '../../../core/edu-sharing.service';

@Component({
    selector: 'app-result-card-content-compact',
    templateUrl: './result-card-content-compact.component.html',
    styleUrls: ['./result-card-content-compact.component.scss'],
})
export class ResultCardContentCompactComponent {
    @Input() hit: ResultNode;
    @Input() filters: Filters;
    @ViewChild('cardButton') cardButton: HTMLButtonElement;

    constructor(private view: ViewService) {}

    onClick(): void {
        this.view.selectItem(this.hit);
    }
}
