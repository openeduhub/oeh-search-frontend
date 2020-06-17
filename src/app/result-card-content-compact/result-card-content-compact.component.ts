import { Component, Input, OnInit } from '@angular/core';
import { Hit } from '../result-card/result-card.component';
import { Filters, SearchService } from '../search.service';

@Component({
    selector: 'app-result-card-content-compact',
    templateUrl: './result-card-content-compact.component.html',
    styleUrls: ['./result-card-content-compact.component.scss'],
})
export class ResultCardContentCompactComponent implements OnInit {
    @Input() result: Hit;
    @Input() filters: Filters;

    isExpanded = false;

    constructor(private search: SearchService) {}

    ngOnInit(): void {}
}
