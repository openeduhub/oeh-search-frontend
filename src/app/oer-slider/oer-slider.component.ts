import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchParametersService } from '../search-parameters.service';

enum OerLevel {
    NONE,
    ALL,
}

@Component({
    selector: 'app-oer-slider',
    templateUrl: './oer-slider.component.html',
    styleUrls: ['./oer-slider.component.scss'],
})
export class OerSliderComponent implements OnInit, OnDestroy {
    show: boolean;
    value: OerLevel;

    private subscriptions: Subscription[] = [];

    constructor(private searchParameters: SearchParametersService, private router: Router) {}

    ngOnInit(): void {
        this.subscriptions.push(
            this.searchParameters.get().subscribe((searchParameters) => {
                if (searchParameters) {
                    this.show = true;
                    this.value = OerLevel[searchParameters.oer];
                } else {
                    this.show = false;
                }
            }),
        );
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    formatLabel(value: number) {
        return OerLevel[value];
    }

    setValue(value: number) {
        this.value = value;
        this.onValueChange(value);
    }

    onValueChange(value: number) {
        this.router.navigate(this.router.url.startsWith('/search') ? [] : ['/search'], {
            queryParams: { oer: OerLevel[value], pageIndex: 0 },
            queryParamsHandling: 'merge',
        });
    }
}
