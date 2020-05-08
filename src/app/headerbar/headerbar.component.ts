import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { parseSearchQueryParams } from '../utils';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-headerbar',
    templateUrl: './headerbar.component.html',
    styleUrls: ['./headerbar.component.scss'],
})
export class HeaderbarComponent implements OnInit {
    showFilterBar: boolean;
    filterCount: number;
    showFiltersButton: boolean;

    constructor(private route: ActivatedRoute, private router: Router) {}

    ngOnInit() {
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                this.showFiltersButton = event.url.startsWith('/search');
            });
        this.route.queryParamMap.subscribe((queryParamMap) => {
            const { filters, showFilterBar } = parseSearchQueryParams(queryParamMap);
            this.showFilterBar = showFilterBar;
            this.filterCount = Object.keys(filters).filter((k) => filters[k]?.length).length;
        });
    }
}
