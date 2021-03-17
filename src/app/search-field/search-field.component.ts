import { CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { debounceTime, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { Facet, Type } from '../../generated/graphql';
import { SearchParametersService } from '../search-parameters.service';
import { Facets, Filters, SearchService } from '../search.service';

type Suggestions = { [key in Facet]?: string[] };

@Component({
    selector: 'app-search-field',
    templateUrl: './search-field.component.html',
    styleUrls: ['./search-field.component.scss'],
})
export class SearchFieldComponent implements OnInit, OnDestroy {
    @ViewChild(CdkConnectedOverlay) overlay: CdkConnectedOverlay;
    @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

    readonly Facet = Facet;
    readonly Type = Type;
    readonly overlayPositions: ConnectedPosition[] = [
        {
            originX: 'center',
            originY: 'bottom',
            offsetX: 0,
            offsetY: 4,
            overlayX: 'center',
            overlayY: 'top',
        },
    ];

    /** Categories to be shown in the suggestion card when the search field is empty. */
    readonly initialCategories: Facet[] = [Facet.Type, Facet.EducationalContext, Facet.Discipline];

    readonly categories: Facet[] = [
        // Facet.Oer,
        Facet.Type,
        Facet.EducationalContext,
        Facet.Discipline,
        Facet.Keyword,
        Facet.IntendedEndUserRole,
        Facet.LearningResourceType,
        Facet.Source,
    ];

    /** Categories to be shown in the suggestion card. */
    activeCategories = this.initialCategories;
    searchField = new FormControl();
    filters: Filters = {};
    suggestions: Suggestions;
    showOverlay = false;
    hasSuggestions: boolean;

    private destroyed$: Subject<void> = new Subject();

    constructor(
        private router: Router,
        private search: SearchService,
        private searchParameters: SearchParametersService,
    ) {}

    ngOnInit(): void {
        this.searchParameters
            .get()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((searchParameters) => {
                const { searchString, filters } = searchParameters || {};
                this.searchField.setValue(searchString, { emitEvent: false });
                this.filters = filters ?? {};
            });
        combineLatest([
            this.searchField.valueChanges.pipe(startWith(this.searchField.value)),
            this.searchParameters.get(),
        ])
            .pipe(
                debounceTime(200),
                switchMap(([inputString]) =>
                    this.search
                        .getFacetSuggestions(inputString)
                        .pipe(map((facets) => ({ facets, inputString }))),
                ),
            )
            .subscribe(({ facets, inputString }) => {
                this.updateSuggestions(facets, inputString);
            });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    onOutsideClick(event: MouseEvent): void {
        const clickTarget = event.target as HTMLElement;
        if (!(this.overlay.origin.elementRef.nativeElement as HTMLElement).contains(clickTarget)) {
            this.showOverlay = false;
        }
    }

    onSubmit(): void {
        this.showOverlay = false;
        this.router.navigate(this.router.url.startsWith('/search') ? [] : ['/search'], {
            queryParams: {
                q: this.searchField.value,
                pageIndex: undefined,
            },
            queryParamsHandling: 'merge',
        });
    }

    addFilter(category: Facet, filter: string): void {
        if (!this.filters[category]) {
            this.filters[category] = [];
        }
        if (!this.filters[category].includes(filter)) {
            this.filters[category].push(filter);
            this.searchField.setValue('');
        }
        setTimeout(() => {
            this.searchInput.nativeElement.focus();
        });
        this.applySearch();
    }

    removeFilter(category: Facet, filter: string): void {
        const index = this.filters[category].indexOf(filter);
        if (index >= 0) {
            this.filters[category].splice(index, 1);
        }
        this.applySearch();
    }

    clear() {
        this.searchField.setValue('');
        this.onSubmit();
    }

    private updateSuggestions(facets: Facets, inputString: string): void {
        if (inputString) {
            this.activeCategories = this.categories;
        } else {
            this.activeCategories = this.initialCategories;
        }
        if (!facets) {
            this.hasSuggestions = false;
            this.suggestions = {};
        } else {
            const suggestions: Suggestions = {};
            for (const category of this.categories) {
                suggestions[category] = facets[category]?.buckets.map((bucket) => bucket.key);
            }
            this.hasSuggestions = Object.values(suggestions).some((entries) => entries.length > 0);
            this.suggestions = suggestions;
        }
    }

    private applySearch() {
        const filters = this.filters;
        for (const key in filters) {
            if (!filters[key] || filters[key].length === 0) {
                delete filters[key];
            }
        }
        this.router.navigate(['/search'], {
            queryParams: {
                q: this.searchField.value || undefined,
                filters: Object.entries(filters).length > 0 ? JSON.stringify(filters) : undefined,
                pageIndex: undefined,
            },
            queryParamsHandling: 'merge',
        });
    }
}
