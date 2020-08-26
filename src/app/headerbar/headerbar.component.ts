import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { parseSearchQueryParams, SearchParametersService } from '../search-parameters.service';
import { filter, find, first, skip } from 'rxjs/operators';
import { ViewService } from '../view.service';

@Component({
    selector: 'app-headerbar',
    templateUrl: './headerbar.component.html',
    styleUrls: ['./headerbar.component.scss'],
})
export class HeaderbarComponent implements OnInit {
    filterCount = 0;
    showFiltersButton: boolean;

    constructor(private route: ActivatedRoute, private router: Router,
                private searchParameters: SearchParametersService,
                private view: ViewService) {}

    ngOnInit() {
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                this.showFiltersButton = this.router.url.startsWith('/search');
            });
        // DEPRECATED:
        /*
        this.route.queryParamMap.subscribe((queryParamMap) => {
            const { filters } = parseSearchQueryParams(queryParamMap);
            // Explicitly use filters given in the query parameters directly (without going through
            // search-parameters service) to omit a counter on pages of the form
            // 'search/:educationalContext/:discipline', where filters are already shown with
            // breadcrumbs.
            // this.filterCount = Object.keys(filters).filter((k) => filters[k]?.length).length;
        });
        */

        this.searchParameters.get()
            .subscribe((params) => {
                if (params) {
                    const filters = params?.filters;
                    this.filterCount =
                        Object.keys(filters).filter((k) => filters[k]?.length).length;
                }
            });
    }

    toggleFilterBar() {
        this.view.toggleShowFilterBar();
    }
}
