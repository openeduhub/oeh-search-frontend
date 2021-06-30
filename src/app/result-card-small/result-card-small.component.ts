import { Component, Input } from '@angular/core';
import { ResultFragment } from '../../generated/graphql';
import { Unpacked } from '../utils';
import { ViewService } from '../view.service';

type Hits = ResultFragment['hits'];
type Hit = Unpacked<Hits>;

@Component({
    selector: 'app-result-card-small',
    templateUrl: './result-card-small.component.html',
    styleUrls: ['./result-card-small.component.scss'],
})
export class ResultCardSmallComponent {
    @Input() hit: Hit;

    constructor(private view: ViewService) {}

    onClick(): void {
        this.view.selectItem(this.hit);
    }
}
