import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { filter, startWith, takeUntil } from 'rxjs/operators';
import { ConfigService } from '../config.service';
import { PageConfig, PageModeService } from '../page-mode.service';
import { SearchParametersService } from '../search-parameters.service';
import { ViewService } from '../view.service';

@Component({
    selector: 'app-headerbar',
    templateUrl: './headerbar.component.html',
    styleUrls: ['./headerbar.component.scss'],
    standalone: false,
})
export class HeaderbarComponent implements OnInit, OnDestroy {
    @HostBinding('attr.data-style') headerStyle: PageConfig['headerStyle'];

    readonly routerPath = this.config.get().routerPath;
    showFiltersButton: boolean;
    filterCount: number = 0;
    private readonly destroyed$ = new ReplaySubject<void>();

    constructor(
        private config: ConfigService,
        private router: Router,
        private view: ViewService,
        private pageMode: PageModeService,
        private searchParameters: SearchParametersService,
    ) {
        this.pageMode
            .getPageConfig('headerStyle')
            .pipe(takeUntil(this.destroyed$))
            .subscribe((headerStyle) => (this.headerStyle = headerStyle));
    }

    ngOnInit() {
        this.router.events
            .pipe(
                takeUntil(this.destroyed$),
                filter((event) => event instanceof NavigationEnd),
                startWith(null as NavigationEnd),
            )
            .subscribe((event: NavigationEnd) => {
                this.showFiltersButton = this.router.url.startsWith(
                    this.config.get().routerPath + '/search',
                );
            });

        this.searchParameters
            .get()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((params) => {
                if (params) {
                    const filters = params.filters;
                    this.filterCount = Object.entries(filters)
                        // Ignore the OER filter for the button-badge count since the OER filter is
                        // not handled by the filter sidebar toggled by the button.
                        .filter(([k]) => k !== 'oer')
                        .reduce((acc, [_, values]) => acc + values.length, 0);
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    toggleFilterBar() {
        this.view.toggleShowFilterBar();
    }
}
