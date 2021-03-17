import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ViewService } from '../view.service';

@Component({
    selector: 'app-headerbar',
    templateUrl: './headerbar.component.html',
    styleUrls: ['./headerbar.component.scss'],
})
export class HeaderbarComponent implements OnInit, OnDestroy {
    readonly showExperiments = environment.showExperiments;
    showFiltersButton: boolean;

    private subscriptions: Subscription[] = [];

    constructor(private router: Router, private view: ViewService) {}

    ngOnInit() {
        this.subscriptions.push(
            this.router.events
                .pipe(filter((event) => event instanceof NavigationEnd))
                .subscribe((event: NavigationEnd) => {
                    this.showFiltersButton = this.router.url.startsWith('/search');
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
