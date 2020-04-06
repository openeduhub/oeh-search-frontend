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
        // Any user input that affects results is funneled through query params. On any such input,
        // we call `router.navigate`. The rest is handled by `onQueryParams`, both, when initially
        // loading and when updating the page.
        activatedRoute.queryParams.subscribe((params) => this.onQueryParams(params));
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
            queryParamsHandling: 'merge',
        });
    }

    onAutocompleteSelected(event: MatAutocompleteSelectedEvent) {
        this.router.navigate([], {
            queryParams: { q: event.option.value, pageIndex: 0 },
            queryParamsHandling: 'merge',
        });
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

    private onQueryParams(params: Params) {
        this.searchString = params.q;
        this.searchField.setValue(this.searchString);
        if (params.filters) {
            this.filters = JSON.parse(params.filters);
        } else {
            this.filters = {};
        }
        if (this.facetFilters) {
            this.facetFilters.reset(this.filters, { emitEvent: false });
            // If `facetFilters` are not yet initialized, this will be done on initialization.
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
            // Create a new object with every key of `facets` mapped to an empty array. This will
            // create a new form control for each facet with nothing selected.
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
            // Leave the facet object in place if it already exists, so Angular won't reconstruct
            // the whole thing and the select dialog won't close every time the user selects an
            // option.
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
