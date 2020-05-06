import { Component, OnInit, Input } from '@angular/core';
import { ExtendedHit } from '../search-results/search-results.component';
import { Filters } from '../search.service';

@Component({
    selector: 'app-result-card',
    templateUrl: './result-card.component.html',
    styleUrls: ['./result-card.component.scss'],
})
export class ResultCardComponent implements OnInit {
    @Input() result: ExtendedHit;
    @Input() filters: Filters;

    constructor() {}

    ngOnInit(): void {}
}
