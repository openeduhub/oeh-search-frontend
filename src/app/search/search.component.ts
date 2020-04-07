import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
    MatAutocompleteSelectedEvent,
    MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, first, tap } from 'rxjs/operators';
import { Facets, Filters, SearchService, DidYouMeanSuggestion } from '../search.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
    @ViewChild('autoComplete') autoComplete: MatAutocompleteTrigger;

    searchField = new FormControl();
    autoCompleteSuggestions$: Observable<string[]>;
    facets: Facets;
    facetFilters: FormGroup;
    filters: Filters = {};
    didYouMeanSuggestion: DidYouMeanSuggestion;

    private searchString: string;

    constructor(
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private router: Router,
        private search: SearchService,
    ) {}

    ngOnInit(): void {
        // Any user input that affects results is funneled through query params. On any such input,
        // we call `router.navigate`. The rest is handled by `onQueryParams`, both, when initially
        // loading and when updating the page.
        this.route.queryParams.subscribe((params) => this.onQueryParams(params));
        this.registerInputFieldListener();
        this.registerSearchObservers();
    }

    onSubmit() {
        this.autoComplete.closePanel();
        this.router.navigate([], {
            relativeTo: this.route,
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

    private registerSearchObservers() {
        this.search.getFacets().subscribe((facets) => this.setFacets(facets));
        this.search
            .getFacets()
            .pipe(
                filter((facets) => facets !== null),
                first(),
            )
            .subscribe((facets) => this.initFacetFilters(facets));
        this.search
            .getDidYouMeanSuggestion()
            .subscribe(
                (didYouMeanSuggestion) => (this.didYouMeanSuggestion = didYouMeanSuggestion),
            );
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
                relativeTo: this.route,
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
        this.autoCompleteSuggestions$ = this.search.autoComplete(searchString);
    }
}
