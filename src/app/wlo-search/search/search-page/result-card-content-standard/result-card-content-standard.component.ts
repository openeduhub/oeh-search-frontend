import { Component, Input, ViewChild } from '@angular/core';
import { ViewService } from '../../../core/view.service';
import { Filters, ResultNode } from '../../../core/edu-sharing.service';

@Component({
    selector: 'app-result-card-content-standard',
    templateUrl: './result-card-content-standard.component.html',
    styleUrls: ['./result-card-content-standard.component.scss'],
})
export class ResultCardContentStandardComponent {
    @Input() hit: ResultNode;
    @Input() filters: Filters;
    @ViewChild('cardButton') cardButton: HTMLButtonElement;

    thumbnail: string;

    constructor(private view: ViewService) {}

    onClick(): void {
        this.view.selectItem(this.hit);
    }
}
