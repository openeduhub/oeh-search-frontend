import { CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { Facet } from '../../generated/graphql';
import { SearchParametersService } from '../search-parameters.service';
import { Facets, Filters, SearchService } from '../search.service';

type Suggestions = { [key in Facet]?: string[] };

@Component({
    selector: 'app-new-search-field',
    templateUrl: './new-search-field.component.html',
    styleUrls: ['./new-search-field.component.scss'],
})
export class NewSearchFieldComponent implements OnInit, OnDestroy {
    @ViewChild(CdkConnectedOverlay) overlay: CdkConnectedOverlay;
    @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

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

    readonly categories: Facet[] = [
        // Facet.Oer,
        Facet.EducationalContext,
        Facet.Discipline,
        Facet.Keyword,
    ];

    searchField = new FormControl();
    filters: Filters = {};
    suggestions: Suggestions;
    showOverlay = false;
    hasSuggestions: boolean;

    private destroyed$: Subject<void> = new Subject();

    constructor(
        private router: Router,
        private searchParameters: SearchParametersService,
        private search: SearchService,
    ) {}

    ngOnInit(): void {
        this.searchParameters
            .get()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((searchParameters) => {
                const { searchString, filters } = searchParameters || {};
                this.searchField.setValue(searchString, { emitEvent: false });
                this.filters = filters ?? {};
                this.suggestions = this.filters;
            });
        combineLatest([
            this.search.getFacets().pipe(takeUntil(this.destroyed$)),
            this.searchField.valueChanges.pipe(startWith(this.searchField.value)),
        ]).subscribe(
            ([facets, searchString]) =>
                (this.suggestions = this.getSuggestions(facets, searchString)),
        );
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
        this.router.navigate(['/search']);
    }

    private getSuggestions(facets: Facets, searchString: string): Suggestions {
        if (!facets) {
            this.hasSuggestions = false;
            return {};
        }
        const suggestions: Suggestions = {};
        for (const category of this.categories) {
            suggestions[category] = facets[category]?.buckets
                .map((bucket) => bucket.key)
                .filter((bucketKey) =>
                    searchString
                        ? bucketKey.toLowerCase().includes(searchString.toLowerCase())
                        : true,
                )
                .slice(0, 5);
        }
        this.hasSuggestions = Object.values(suggestions).some((entries) => entries.length > 0);
        return suggestions;
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
