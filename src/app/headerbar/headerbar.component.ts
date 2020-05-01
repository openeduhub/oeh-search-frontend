import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-headerbar',
    templateUrl: './headerbar.component.html',
    styleUrls: ['./headerbar.component.scss'],
})
export class HeaderbarComponent {
    filter: boolean;
    filterCount: number;
    constructor(private route: ActivatedRoute) {
        this.route.queryParams.subscribe((params) => {
            this.filter = params.filter === 'true';
            this.filterCount = 0;
            if (params.filters) {
                const filters = JSON.parse(params.filters);
                this.filterCount = Object.keys(filters).filter((k) => filters[k]?.length).length;
            }
        });
    }
}
