import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ReplaySubject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PageConfig, PageModeService } from '../page-mode.service';
import { ViewService } from '../view.service';

@Component({
    selector: 'app-headerbar',
    templateUrl: './headerbar.component.html',
    styleUrls: ['./headerbar.component.scss'],
})
export class HeaderbarComponent implements OnInit, OnDestroy {
    @HostBinding('attr.data-style') headerStyle: PageConfig['headerStyle'];

    readonly showExperiments = environment.showExperiments;
    showFiltersButton: boolean;
    private readonly destroyed$ = new ReplaySubject<void>();

    constructor(
        private router: Router,
        private view: ViewService,
        private pageMode: PageModeService,
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
            )
            .subscribe((event: NavigationEnd) => {
                this.showFiltersButton = this.router.url.startsWith('/search');
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
