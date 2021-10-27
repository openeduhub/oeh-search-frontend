import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Filters } from '../../../core/edu-sharing.service';
import { ResolveService } from '../../../core/resolve.service';
import { SearchParametersService } from '../../../core/search-parameters.service';
import {
    SubjectsPortalResolverService,
    SubjectsPortalResults,
} from './subjects-portal-resolver.service';

@Component({
    selector: 'app-subjects-portal',
    templateUrl: './subjects-portal.component.html',
    styleUrls: ['./subjects-portal.component.scss'],
})
export class SubjectsPortalComponent implements OnInit, OnDestroy {
    results: SubjectsPortalResults;
    filters: Filters;
    isExpanded: boolean;

    private readonly destroyed$ = new Subject<void>();

    constructor(
        private searchParameters: SearchParametersService,
        private route: ActivatedRoute,
        private resolver: SubjectsPortalResolverService,
        private resolve: ResolveService,
    ) {}

    ngOnInit(): void {
        // this.route.data.subscribe((data: { results: SubjectsPortalResults }) => {
        this.resolve
            .resolve(this.resolver, this.route)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((results) => {
                this.results = results;
            });
        this.searchParameters
            .get()
            .pipe(takeUntil(this.destroyed$))
            .subscribe(({ filters, pageIndex }) => {
                this.filters = filters;
                this.isExpanded = pageIndex === 0;
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}