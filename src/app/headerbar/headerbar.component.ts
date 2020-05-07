import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { parseSearchQueryParams } from '../utils';

@Component({
    selector: 'app-headerbar',
    templateUrl: './headerbar.component.html',
    styleUrls: ['./headerbar.component.scss'],
})
export class HeaderbarComponent {
    showFilterBar: boolean;
    filterCount: number;
    constructor(private route: ActivatedRoute) {
        this.route.queryParamMap.subscribe((queryParamMap) => {
            const { filters, showFilterBar } = parseSearchQueryParams(queryParamMap);
            this.showFilterBar = showFilterBar;
            this.filterCount = Object.keys(filters).filter((k) => filters[k]?.length).length;
        });
    }
}
