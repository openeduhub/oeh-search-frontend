import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { parseSearchQueryParams } from '../utils';
import { filter } from 'rxjs/operators';
import { ViewService } from '../view.service';

@Component({
    selector: 'app-headerbar',
    templateUrl: './headerbar.component.html',
    styleUrls: ['./headerbar.component.scss'],
})
export class HeaderbarComponent implements OnInit {
    filterCount: number;
    showFiltersButton: boolean;

    constructor(private route: ActivatedRoute, private router: Router, private view: ViewService) {}

    ngOnInit() {
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                this.showFiltersButton = this.router.url.startsWith('/search');
            });
        this.route.queryParamMap.subscribe((queryParamMap) => {
            const { filters } = parseSearchQueryParams(queryParamMap);
            this.filterCount = Object.keys(filters).filter((k) => filters[k]?.length).length;
        });
    }

    toggleFilterBar() {
        this.view.toggleShowFilterBar();
    }
}
