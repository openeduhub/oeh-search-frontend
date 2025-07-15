import { Component, Input, ViewChild } from '@angular/core';
import { Node } from 'ngx-edu-sharing-api';
import { Filters } from '../../../core/edu-sharing.service';
import { ViewService } from '../../../core/view.service';

@Component({
    selector: 'app-result-card-content-standard',
    templateUrl: './result-card-content-standard.component.html',
    styleUrls: ['./result-card-content-standard.component.scss'],
    standalone: false,
})
export class ResultCardContentStandardComponent {
    @Input() hit: Node;
    @Input() filters: Filters;
    @Input() playAnimation: boolean;
    @ViewChild('cardButton') cardButton: HTMLButtonElement;

    thumbnail: string;

    constructor(private view: ViewService) {}

    onClick(): void {
        this.view.selectItem(this.hit);
    }
}
