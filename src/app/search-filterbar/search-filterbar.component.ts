import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Facets, Filters } from '../search.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SortPipe } from '../sort.pipe';

@Component({
    selector: 'app-search-filterbar',
    templateUrl: './search-filterbar.component.html',
    styleUrls: ['./search-filterbar.component.scss'],
})
export class SearchFilterbarComponent implements OnInit, OnChanges {
    @Input() facets: Facets;

    show = false;
    filters: Filters = {};
    facetFilters: FormGroup;
    expanded = ['disciplines', 'educationalContexts'];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.facets) {
            this.initFacetFilters(changes.facets.currentValue);
        }
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            if (params.filters) {
                this.filters = JSON.parse(params.filters);
            } else {
                this.filters = {};
            }
            this.show = params.filter === 'true';
            if (this.facetFilters) {
                this.facetFilters.reset(this.filters, { emitEvent: false });
                // If `facetFilters` are not yet initialized, this will be done on initialization.
            }
        });
    }

    toggle(key: string) {
        this.expanded.indexOf(key) === -1
            ? this.expanded.push(key)
            : this.expanded.splice(this.expanded.indexOf(key), 1);
    }

    // does not transfer via template
    getLicenses() {
        return new SortPipe().transform(
            this.facets.licenseOER.buckets,
    {key: 'key', values: ['NONE', 'MIXED', 'ALL']});
    }
    // does not transfer via template
    getTypes() {
        return new SortPipe().transform(
            this.facets.types.buckets,
            {key: 'key', values: ['MATERIAL', 'TOOL', 'SOURCE']});
    }

    /*
    private initFacetFilters(facets: Facets) {
        console.log(facets);
        this.facetFilters = this.formBuilder.group(
            {},
            // Create a new object with every key of `facets` mapped to an empty array. This will
            // create a new form control for each facet with nothing selected.
        );
        for (const key of Object.keys(facets)) {
            this.facetFilters.registerControl(key, this.formBuilder.group({}));
            for (const b of facets[key].buckets) {
                (this.facetFilters.get(key) as FormGroup).addControl(
                    b.key,
                    this.formBuilder.control(false),
                );
            }
            this.facetFilters.get(key).valueChanges.subscribe(() => {
                console.log(this.facetFilters.value);
            });
        }
        // Apply values loaded from queryParams.
        if (this.filters) {
            this.facetFilters.patchValue(this.filters);
        }
        console.log(this.facetFilters);
        this.facetFilters.valueChanges.subscribe((filters: Filters) => {
            console.log(filters);
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { filters: JSON.stringify(filters), pageIndex: 0 },
                queryParamsHandling: 'merge',
            });
        });
        this.updateFacetFilters();
    }
    */

    private initFacetFilters(facets: Facets) {
        console.log(facets);
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
        this.updateFacetFilters();
    }

    private updateFacetFilters() {
        /*
        for (const [label, facet] of Object.entries(this.facets)) {
            const control = this.facetFilters.get(label);
            if (facet.buckets && facet.buckets.length > 0) {
                control.enable({ emitEvent: false });
            } else {
                control.disable({ emitEvent: false });
            }
        }
       */
    }
}