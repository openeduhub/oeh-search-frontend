import { Component, Input, ViewChild } from '@angular/core';
import { Filters, ResultNode } from '../edu-sharing/edu-sharing.service';
import { ViewService } from '../view.service';

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
