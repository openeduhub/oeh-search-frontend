import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Results, Filters } from '../search.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'app-search-results',
    templateUrl: './search-results.component.html',
    styleUrls: ['./search-results.component.scss'],
})
export class SearchResultsComponent implements OnInit {
    results: Results;

    pageInfo = {
        pageIndex: 0,
        pageSize: 10,
    };

    filters: Filters = {};

    constructor(private route: ActivatedRoute, private router: Router) {}

    ngOnInit(): void {
        this.route.data.subscribe((data: { results: Results }) => (this.results = data.results));
        this.route.queryParams.subscribe((params) => {
            if (params.pageIndex) {
                this.pageInfo.pageIndex = params.pageIndex;
            }
            if (params.pageSize) {
                this.pageInfo.pageSize = params.pageSize;
            }
            if (params.filters) {
                this.filters = JSON.parse(params.filters);
            }
        });
    }

    onPage(pageEvent: PageEvent) {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                pageIndex: pageEvent.pageIndex,
                pageSize: pageEvent.pageSize,
            },
            queryParamsHandling: 'merge',
        });
    }
}
