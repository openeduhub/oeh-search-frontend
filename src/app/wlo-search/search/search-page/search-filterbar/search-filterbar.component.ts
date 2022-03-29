import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { FacetsDict, FacetValue } from 'ngx-edu-sharing-api';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { facetProperties } from 'src/app/wlo-search/core/facet-properties';
import { ConfigService } from '../../../core/config.service';
import { EduSharingService, Facet, Filters } from '../../../core/edu-sharing.service';
import { SearchParametersService } from '../../../core/search-parameters.service';
import { ViewService } from '../../../core/view.service';

@Component({
    selector: 'app-search-filterbar',
    templateUrl: './search-filterbar.component.html',
    styleUrls: ['./search-filterbar.component.scss'],
})
export class SearchFilterbarComponent implements OnInit, OnDestroy {
    readonly routerPath = this.config.get().routerPath;
    readonly mainFilters: Array<Facet> = [
        'oehLrtAggregated',
        'discipline',
        'educationalContext',
        'intendedEndUserRole',
        'source',
        'keyword',
    ];
    facets: FacetsDict;
    hasFacets: boolean;
    filters: Filters = {};
    facetFilters: FormGroup;
    expandedFilters: { [key in Facet]?: boolean } = {
        oehLrtAggregated: true,
        discipline: true,
    };

    private destroyed$ = new Subject<void>();

    constructor(
        private config: ConfigService,
        private formBuilder: FormBuilder,
        private router: Router,
        private eduSharing: EduSharingService,
        private searchParameters: SearchParametersService,
        private view: ViewService,
    ) {}

    ngOnInit(): void {
        // Any user input that affects results is funneled through query params. On any such input,
        // we call `router.navigate`. The rest is handled by `onQueryParams`, both, when initially
        // loading and when updating the page.
        this.searchParameters
            .getCopy()
            .pipe(takeUntil(this.destroyed$))
            .subscribe(({ filters }) => {
                this.filters = filters;
                if (this.facetFilters) {
                    // If `facetFilters` are not yet initialized, this will be
                    // done on initialization.
                    this.facetFilters.reset(filters, { emitEvent: false });
                    this.expandActiveFilters();
                }
            }),
            this.eduSharing
                .getFacets()
                .pipe(takeUntil(this.destroyed$))
                .subscribe((facets) => this.updateFacets(facets)),
            this.eduSharing
                .getFacets()
                .pipe(
                    takeUntil(this.destroyed$),
                    first((facets) => facets !== null),
                )
                .subscribe((facets) => this.initFacetFilters(facets));
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    closeFilterBar() {
        this.view.setShowFilterBar(false);
    }

    loadMoreFacetBuckets(facet: Facet) {
        const currentlyShownBuckets = this.facets[facet].values.length;
        this.eduSharing.loadMoreFacetValues(facet, currentlyShownBuckets + 20);
    }

    /**
     * Initialize visual representation of facet filters.
     *
     * Call only once.
     */
    private initFacetFilters(facets: FacetsDict) {
        this.facetFilters = this.formBuilder.group(
            // Create a new object with every facet field mapped to an empty
            // array. This will create a new form control for each facet with
            // nothing selected.
            Object.keys(facetProperties).reduce((acc, facet) => ({ ...acc, [facet]: [] }), {}),
        );
        // Apply values loaded from queryParams.
        if (this.filters) {
            this.facetFilters.patchValue(this.filters);
            this.expandActiveFilters();
        }
        this.facetFilters.valueChanges.subscribe((filters: Filters) => this.applyFilters(filters));
    }

    private updateFacets(facets: FacetsDict) {
        if (!facets) {
            return;
        }
        if (!this.facets) {
            this.facets = {} as FacetsDict;
        }
        for (const [facet, property] of Object.entries(facetProperties)) {
            // Leave the facets object in place if it already exists, so Angular
            // won't reconstruct the whole thing every time the user selects an
            // option.
            this.facets[facet] = facets[property] ?? { values: [], hasMore: false };
        }
        this.hasFacets = Object.values(facets).some((facet) => facet.values.length > 0);
    }

    private expandActiveFilters() {
        for (const [key, value] of Object.entries(this.facets)) {
            if (typeof value !== 'object') {
                continue;
            }
            const filterValues = this.filters[key as Facet];
            if (filterValues && filterValues.length > 0) {
                this.expandedFilters[key as Facet] = true;
            }
        }
    }

    private applyFilters(filters: Filters) {
        for (const key in filters) {
            const filter = filters[key as Facet];
            if (!filter || filter.length === 0) {
                delete filters[key as Facet];
            }
        }
        this.router.navigate([], {
            queryParams: {
                filters: Object.entries(filters).length > 0 ? JSON.stringify(filters) : undefined,
                pageIndex: 0,
            },
            queryParamsHandling: 'merge',
            fragment: 'keep', // Don't scroll to top after navigation.
        });
    }
}

function orderByProperty<T, K extends keyof T>(
    array: readonly T[],
    key: K,
    ordering: Array<T[K]>,
): T[] {
    return [...array].sort((a, b) =>
        ordering.indexOf(a[key]) < ordering.indexOf(b[key]) ? -1 : 1,
    );
}
