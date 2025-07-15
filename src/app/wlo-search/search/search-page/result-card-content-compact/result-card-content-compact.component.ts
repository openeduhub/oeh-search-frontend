import { Component, Input, ViewChild } from '@angular/core';
import { Node } from 'ngx-edu-sharing-api';
import { Filters } from '../../../core/edu-sharing.service';
import { ViewService } from '../../../core/view.service';

@Component({
    selector: 'app-result-card-content-compact',
    templateUrl: './result-card-content-compact.component.html',
    styleUrls: ['./result-card-content-compact.component.scss'],
    standalone: false,
})
export class ResultCardContentCompactComponent {
    @Input() hit: Node;
    @Input() filters: Filters;
    @ViewChild('cardButton') cardButton: HTMLButtonElement;

    constructor(private view: ViewService) {}

    onClick(): void {
        this.view.selectItem(this.hit);
    }
}
