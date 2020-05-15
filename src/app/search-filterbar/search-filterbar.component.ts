import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { Facets, Filters, SearchService } from '../search.service';
import { SortPipe } from '../sort.pipe';
import { parseSearchQueryParams } from '../utils';

@Component({
    selector: 'app-search-filterbar',
    templateUrl: './search-filterbar.component.html',
    styleUrls: ['./search-filterbar.component.scss'],
})
export class SearchFilterbarComponent implements OnInit, OnDestroy {
    facets: Facets;
    filters: Filters = {};
    facetFilters: FormGroup;
    expanded = ['disciplines', 'educationalContexts'];

    private subscriptions: Subscription[] = [];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private search: SearchService,
    ) {}

    ngOnInit(): void {
        // Any user input that affects results is funneled through query params. On any such input,
        // we call `router.navigate`. The rest is handled by `onQueryParams`, both, when initially
        // loading and when updating the page.
        this.subscriptions.push(
            this.route.queryParamMap.subscribe((queryParamMap) => {
                const { filters } = parseSearchQueryParams(queryParamMap);
                this.setFilters(filters);
                if (this.facetFilters) {
                    this.facetFilters.reset(filters, { emitEvent: false });
                    // If `facetFilters` are not yet initialized, this will be
                    // done on initialization.
                }
            }),
        );

        this.subscriptions.push(
            this.search.getFacets().subscribe((facets) => this.updateFacets(facets)),
        );
        // Don't need to unsubscribe since subscription completes after first value.
        this.search
            .getFacets()
            .pipe(
                filter((facets) => facets !== null),
                first(),
            )
            .subscribe((facets) => this.initFacetFilters(facets));
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    toggle(key: string) {
        this.expanded.indexOf(key) === -1
            ? this.expanded.push(key)
            : this.expanded.splice(this.expanded.indexOf(key), 1);
    }

    // does not transfer via template
    getLicenses() {
        return new SortPipe().transform(this.facets.licenseOER.buckets, {
            key: 'key',
            values: ['NONE', 'MIXED', 'ALL'],
        });
    }

    // does not transfer via template
    getTypes() {
        return new SortPipe().transform(this.facets.types.buckets, {
            key: 'key',
            values: ['MATERIAL', 'TOOL', 'SOURCE'],
        });
    }

    /**
     * Initialize visual representation of facet filters.
     *
     * Call only once.
     */
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
                fragment: 'keep', // Don't scroll to top after navigation.
            });
        });
    }

    private updateFacets(facets: Facets) {
        if (!facets) {
            return;
        }
        if (!this.facets) {
            this.facets = {} as Facets;
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

    private setFilters(filters: Filters) {
        this.filters = filters;
        // Expand active filter categories.
        for (const [key, value] of Object.entries(filters)) {
            if (value && value.length > 0) {
                if (this.expanded.indexOf(key) === -1) {
                    this.expanded.push(key);
                }
            }
        }
    }
}
