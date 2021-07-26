import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ResultFragment } from '../../generated/graphql';
import { PageModeService } from '../page-mode.service';
import { SearchParametersService } from '../search-parameters.service';
import { Filters } from '../search.service';
import { ResultCardStyle, ViewService } from '../view.service';
import { SearchResultsService } from './search-results.service';

@Component({
    selector: 'app-search-results',
    templateUrl: './search-results.component.html',
    styleUrls: ['./search-results.component.scss'],
})
export class SearchResultsComponent implements OnInit, OnDestroy {
    results: ResultFragment;
    filters: Filters;
    readonly resultCardStyle$ = this.view.getResultCardStyle();
    readonly searchResultsStyle$ = this.pageMode.getPageConfig('searchResultsStyle');

    private destroyed$ = new ReplaySubject<void>(1);

    constructor(
        private pageMode: PageModeService,
        private searchParameters: SearchParametersService,
        private searchResults: SearchResultsService,
        private view: ViewService,
    ) {}

    ngOnInit(): void {
        this.searchResults.results
            .pipe(takeUntil(this.destroyed$))
            .subscribe((results) => (this.results = results));
        this.searchParameters
            .get()
            .pipe(takeUntil(this.destroyed$))
            .subscribe(({ filters }) => {
                this.filters = filters;
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
