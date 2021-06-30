import { Component, Input, ViewChild } from '@angular/core';
import { Facet, Type } from '../../generated/graphql';
import { Filters } from '../search.service';
import { Hit, ViewService } from '../view.service';

@Component({
    selector: 'app-result-card-content-standard',
    templateUrl: './result-card-content-standard.component.html',
    styleUrls: ['./result-card-content-standard.component.scss'],
})
export class ResultCardContentStandardComponent {
    @Input() hit: Hit;
    @Input() filters: Filters;
    @ViewChild('cardButton') cardButton: HTMLButtonElement;

    readonly Type = Type;
    readonly Facet = Facet;
    thumbnail: string;

    constructor(private view: ViewService) {}

    onClick(): void {
        this.view.selectItem(this.hit);
    }
}
