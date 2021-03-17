import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { SearchParametersService } from '../search-parameters.service';

@Component({
    selector: 'app-oer-slider',
    templateUrl: './oer-slider.component.html',
    styleUrls: ['./oer-slider.component.scss'],
})
export class OerSliderComponent implements OnInit, OnDestroy {
    readonly wordpressUrl = environment.wordpressUrl;
    show: boolean;
    value: boolean;

    private subscriptions: Subscription[] = [];

    constructor(private searchParameters: SearchParametersService, private router: Router) {}

    ngOnInit(): void {
        this.subscriptions.push(
            this.searchParameters.get().subscribe((searchParameters) => {
                if (searchParameters) {
                    this.show = true;
                    this.value = searchParameters.oer === 'ALL';
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

    setValue(value: boolean) {
        this.value = value;
        this.onValueChange(value);
    }

    onValueChange(value: boolean) {
        this.router.navigate(this.router.url.startsWith('/search') ? [] : ['/search'], {
            queryParams: { oer: value ? 'ALL' : null, pageIndex: 0 },
            queryParamsHandling: 'merge',
        });
    }
}
