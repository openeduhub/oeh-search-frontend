import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SearchParametersService } from '../search-parameters.service';
import { ViewService } from '../view.service';

@Component({
    selector: 'app-headerbar',
    templateUrl: './headerbar.component.html',
    styleUrls: ['./headerbar.component.scss'],
})
export class HeaderbarComponent implements OnInit, OnDestroy {
    filterCount = 0;
    showFiltersButton: boolean;

    private subscriptions: Subscription[] = [];

    constructor(
        private router: Router,
        private searchParameters: SearchParametersService,
        private view: ViewService,
    ) {}

    ngOnInit() {
        this.subscriptions.push(
            this.router.events
                .pipe(filter((event) => event instanceof NavigationEnd))
                .subscribe((event: NavigationEnd) => {
                    this.showFiltersButton = this.router.url.startsWith('/search');
                }),
        );

        this.subscriptions.push(
            this.searchParameters.get().subscribe((params) => {
                if (params) {
                    const filters = params.filters;
                    this.filterCount = Object.keys(filters)
                        // Ignore the OER filter for the button-badge count since the OER filter is
                        // not handled by the filter sidebar toggled by the button.
                        .filter((k) => k !== 'oer')
                        .filter((k) => filters[k]?.length).length;
                }
            }),
        );
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    toggleFilterBar() {
        this.view.toggleShowFilterBar();
    }
}
