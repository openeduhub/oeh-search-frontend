import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfigService } from '../../../core/config.service';
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
    readonly routerPath = this.config.get().routerPath;
    results: SubjectsPortalResults;
    filters: Filters;
    isExpanded: boolean;
    loadingMoreGroups = false;

    private readonly destroyed$ = new Subject<void>();
    readonly unordered = () => 0;

    constructor(
        private config: ConfigService,
        private resolve: ResolveService,
        private resolver: SubjectsPortalResolverService,
        private route: ActivatedRoute,
        private searchParameters: SearchParametersService,
    ) {}

    ngOnInit(): void {
        this.resolve
            .resolve(this.resolver, this.route)
            .subscribe((results) => (this.results = results));
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

    showMoreGroups(): void {
        this.loadingMoreGroups = true;
        this.resolver.showMoreGroups().subscribe((results) => {
            this.loadingMoreGroups = false;
            this.results = results;
        });
    }
}
