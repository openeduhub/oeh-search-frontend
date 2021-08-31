import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import {
    EduSharingService,
    Facet,
    Facets,
    FacetValue,
    Filters,
} from '../edu-sharing/edu-sharing.service';
import { SearchParametersService } from '../search-parameters.service';
import { ViewService } from '../view.service';

@Component({
    selector: 'app-search-filterbar',
    templateUrl: './search-filterbar.component.html',
    styleUrls: ['./search-filterbar.component.scss'],
})
export class SearchFilterbarComponent implements OnInit, OnDestroy {
    readonly mainFilters: Array<Facet> = [
        'discipline',
        'educationalContext',
        'learningResourceType',
        'intendedEndUserRole',
        'source',
        'keyword',
    ];
    facets: Facets;
    hasFacets: boolean;
    orderedTypeBuckets: FacetValue[] | null;
    filters: Filters = {};
    facetFilters: FormGroup;
    expandedFilters: { [key in Facet]?: boolean } = {
        discipline: true,
        educationalContext: true,
    };

    private subscriptions: Subscription[] = [];

    constructor(
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
        this.subscriptions.push(
            this.searchParameters.getCopy().subscribe(({ filters }) => {
                this.filters = filters;
                if (this.facetFilters) {
                    // If `facetFilters` are not yet initialized, this will be
                    // done on initialization.
                    this.facetFilters.reset(filters, { emitEvent: false });
                    this.expandActiveFilters();
                }
            }),
        );

        this.subscriptions.push(
            this.eduSharing.getFacets().subscribe((facets) => this.updateFacets(facets)),
        );
        // Don't need to unsubscribe since subscription completes after first value.
        this.eduSharing
            .getFacets()
            .pipe(first((facets) => facets !== null))
            .subscribe((facets) => this.initFacetFilters(facets));
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    closeFilterBar() {
        this.view.setShowFilterBar(false);
    }

    loadMoreFacetBuckets(facet: Facet) {
        const currentlyShownBuckets = this.facets[facet].values.length;
        // this.eduSharing.loadMoreFacetValues(facet, currentlyShownBuckets + 20);
    }

    /**
     * Initialize visual representation of facet filters.
     *
     * Call only once.
     */
    private initFacetFilters(facets: Facets) {
        this.facetFilters = this.formBuilder.group(
            // Create a new object with every facet field mapped to an empty
            // array. This will create a new form control for each facet with
            // nothing selected.
            Object.keys(facets).reduce((acc, facet) => ({ ...acc, [facet]: [] }), {}),
        );
        // Apply values loaded from queryParams.
        if (this.filters) {
            this.facetFilters.patchValue(this.filters);
            this.expandActiveFilters();
        }
        this.facetFilters.valueChanges.subscribe((filters: Filters) => this.applyFilters(filters));
    }

    private updateFacets(facets: Facets) {
        if (!facets) {
            return;
        }
        if (!this.facets) {
            this.facets = {} as Facets;
        }
        for (const [key, value] of Object.entries(facets)) {
            // Leave the facets object in place if it already exists, so Angular
            // won't reconstruct the whole thing every time the user selects an
            // option.
            if (typeof value === 'object') {
                this.facets[key] = value;
            }
        }
        this.orderedTypeBuckets = orderByProperty(this.facets.type.values, 'id', [
            'MATERIAL',
            'LESSONPLANNING',
            'TOOL',
            'SOURCE',
            'METHOD',
        ]);
        this.hasFacets = Object.values(facets).some((facet) => facet.values.length > 0);
    }

    private expandActiveFilters() {
        for (const [key, value] of Object.entries(this.facets)) {
            if (typeof value !== 'object') {
                continue;
            }
            const filterValues = this.filters[key];
            if (filterValues && filterValues.length > 0) {
                this.expandedFilters[key as keyof Facets] = true;
            }
        }
    }

    private applyFilters(filters: Filters) {
        for (const key in filters) {
            if (!filters[key] || filters[key].length === 0) {
                delete filters[key];
            }
        }
        this.router.navigate(['/search'], {
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
