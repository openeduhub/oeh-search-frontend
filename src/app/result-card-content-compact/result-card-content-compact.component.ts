import { Component, Input, ViewChild } from '@angular/core';
import { EditorialTag } from '../../generated/graphql';
import { Filters } from '../search.service';
import { Hit, ViewService } from '../view.service';

@Component({
    selector: 'app-result-card-content-compact',
    templateUrl: './result-card-content-compact.component.html',
    styleUrls: ['./result-card-content-compact.component.scss'],
})
export class ResultCardContentCompactComponent {
    @Input() hit: Hit;
    @Input() filters: Filters;
    @ViewChild('cardButton') cardButton: HTMLButtonElement;

    readonly EditorialTag = EditorialTag;

    constructor(private view: ViewService) {}

    onClick(): void {
        this.view.selectItem(this.hit);
    }
}
