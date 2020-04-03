import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import {
    MatAutocompleteSelectedEvent,
    MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, filter, first } from 'rxjs/operators';
import { Results, SearchService, Facets, Filters } from '../search.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    providers: [SearchService],
})
export class SearchComponent implements OnInit {
    @ViewChild('autoComplete') autoComplete: MatAutocompleteTrigger;

    searchField = new FormControl();
    results: Results;
    autoCompleteSuggestions$: Observable<string[]>;
    facets: Facets;
    facetFilters: FormGroup;
    filters: Filters = {};
    pageInfo = {
        pageIndex: 0,
        pageSize: 10,
    };

    private searchString: string;

    constructor(
        private activatedRoute: ActivatedRoute,
        private formBuilder: FormBuilder,
        private router: Router,
        private search: SearchService,
    ) {
        activatedRoute.queryParams.subscribe((params) => this.performSearch(params));
        this.registerInputFieldListener();
        this.registerFacetsListener();
    }

    ngOnInit(): void {}

    onPage(pageEvent: PageEvent) {
        this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: {
                pageIndex: pageEvent.pageIndex,
                pageSize: pageEvent.pageSize,
            },
            queryParamsHandling: 'merge',
        });
    }

    onSubmit() {
        this.autoComplete.closePanel();
        this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: {
                q: this.searchString,
                pageIndex: 0,
            },
        });
    }

    onAutocompleteSelected(event: MatAutocompleteSelectedEvent) {
        this.router.navigate(['search', event.option.value]);
    }

    selectKeyword(keyword: string) {
        this.filters.Keywords = [keyword];
        this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: {
                pageIndex: 0,
                filters: JSON.stringify(this.filters),
            },
            queryParamsHandling: 'merge',
        });
    }

    private performSearch(params: Params) {
        this.searchField.setValue(params.q);
        this.searchString = params.q;
        if (params.filters) {
            this.filters = JSON.parse(params.filters);
            // TODO: update facet filters for selectKeyword and browser back, but take care not to
            // trigger another navigation by the change.

            // if (this.facetFilters) {
            //     this.facetFilters.patchValue(this.filters);
            // }
        }
        if (params.pageIndex) {
            this.pageInfo.pageIndex = params.pageIndex;
        }
        if (params.pageSize) {
            this.pageInfo.pageSize = params.pageSize;
        }
        this.updateResults();
    }

    private registerInputFieldListener() {
        this.searchField.valueChanges
            .pipe(
                tap((searchString) => (this.searchString = searchString)),
                debounceTime(200),
                distinctUntilChanged(),
            )
            .subscribe((searchString) => this.onSearchStringChanges(searchString));
    }

    private registerFacetsListener() {
        this.search.getFacets().subscribe((facets) => this.setFacets(facets));
        this.search
            .getFacets()
            .pipe(
                filter((facets) => facets !== null),
                first(),
            )
            .subscribe((facets) => this.initFacetFilters(facets));
    }

    private initFacetFilters(facets: Facets) {
        this.facetFilters = this.formBuilder.group(
            Object.keys(facets).reduce((agg, key) => ({ ...agg, [key]: [] }), {}),
        );
        // Apply values loaded from queryParams.
        if (this.filters) {
            this.facetFilters.patchValue(this.filters);
        }
        this.facetFilters.valueChanges.subscribe((filters: Filters) => {
            this.router.navigate([], {
                relativeTo: this.activatedRoute,
                queryParams: { filters: JSON.stringify(filters), pageIndex: 0 },
                queryParamsHandling: 'merge',
            });
        });
    }

    private setFacets(facets: Facets) {
        if (!facets) {
            return;
        }
        if (!this.facets) {
            this.facets = {};
        }
        for (const [label, facet] of Object.entries(facets)) {
            // Leave the facet object in place if it already exists, so Angular
            // won't reconstruct the whole thing and the select dialog won't
            // close every time the user selects an option.
            if (this.facets[label]) {
                this.facets[label].buckets = facet.buckets;
            } else {
                this.facets[label] = facet;
            }
        }
    }

    private onSearchStringChanges(searchString: string) {
        // this.autoCompleteSuggestions$ = this.search.autoComplete(searchString);
    }

    private updateResults() {
        this.search.search(this.searchString, this.pageInfo, this.filters).subscribe((results) => {
            window.scroll(0, 0);
            this.results = results;
        });
    }
}
