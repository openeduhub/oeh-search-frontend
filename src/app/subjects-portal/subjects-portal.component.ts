import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Type } from '../../generated/graphql';
import { SearchParametersService } from '../search-parameters.service';
import { SearchData, SubjectsPortalResults } from '../search-resolver.service';
import { Filters } from '../search.service';

@Component({
    selector: 'app-subjects-portal',
    templateUrl: './subjects-portal.component.html',
    styleUrls: ['./subjects-portal.component.scss'],
})
export class SubjectsPortalComponent implements OnInit, OnDestroy {
    // readonly Type = Type;
    results: SubjectsPortalResults;
    filters: Filters;
    isExpanded: boolean;

    private subscriptions: Subscription[] = [];

    constructor(private route: ActivatedRoute, private searchParameters: SearchParametersService) {}

    ngOnInit(): void {
        this.route.data.subscribe((data: { searchData: SearchData }) => {
            this.results = data.searchData.subjectsPortalResults;
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
