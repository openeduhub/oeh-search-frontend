import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Filters } from '../edu-sharing/edu-sharing.service';
import { SearchParametersService } from '../search-parameters.service';
import { SubjectsPortalResults } from './subjects-portal-resolver.service';

@Component({
    selector: 'app-subjects-portal',
    templateUrl: './subjects-portal.component.html',
    styleUrls: ['./subjects-portal.component.scss'],
})
export class SubjectsPortalComponent implements OnInit, OnDestroy {
    results: SubjectsPortalResults;
    filters: Filters;
    isExpanded: boolean;

    private subscriptions: Subscription[] = [];

    constructor(private searchParameters: SearchParametersService, private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.data.subscribe((data: { results: SubjectsPortalResults }) => {
            this.results = data.results;
        });
        this.subscriptions.push(
            this.searchParameters.get().subscribe(({ filters, pageIndex }) => {
                this.filters = filters;
                this.isExpanded = pageIndex === 0;
            }),
        );
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }
}
