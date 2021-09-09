import { CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { debounceTime, filter, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { EduSharingService, Facet, Facets, Filters } from '../edu-sharing.service';
import { ConfigService } from '../config.service';
import { SearchParametersService } from '../search-parameters.service';

type Suggestions = { [key in Facet]?: string[] };

@Component({
    selector: 'app-search-field',
    templateUrl: './search-field.component.html',
    styleUrls: ['./search-field.component.scss'],
})
export class SearchFieldComponent implements OnInit, OnDestroy {
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
        'type',
        'educationalContext',
        'discipline',
        'keyword',
        'intendedEndUserRole',
        'learningResourceType',
        'source',
    ];

    searchField = new FormControl();
    filters: Filters = {};
    suggestions: Suggestions;
    showOverlay = false;
    hasSuggestions: boolean;

    private destroyed$: Subject<void> = new Subject();

    constructor(
        private config: ConfigService,
        private router: Router,
        private eduSharing: EduSharingService,
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
                filter(([inputString]) => {
                    if (!inputString || inputString.length < 3) {
                        this.updateSuggestions(null);
                        return false;
                    } else {
                        return true;
                    }
                }),
                switchMap(([inputString]) => this.eduSharing.getFacetSuggestions(inputString)),
            )
            .subscribe((facets) => {
                this.updateSuggestions(facets);
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
        this.router.navigate(
            this.router.url.startsWith(this.config.get().routerPath + '/search')
                ? []
                : [this.config.get().routerPath + '/search'],
            {
                queryParams: {
                    q: this.searchField.value,
                    pageIndex: undefined,
                },
                queryParamsHandling: 'merge',
            },
        );
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

    private updateSuggestions(facets: Facets): void {
        if (!facets) {
            this.hasSuggestions = false;
            this.suggestions = {};
        } else {
            const suggestions: Suggestions = {};
            for (const category of this.categories) {
                suggestions[category] = facets[category]?.values.map((bucket) => bucket.id);
            }
            this.hasSuggestions = Object.values(suggestions).some((entries) => entries.length > 0);
            this.suggestions = suggestions;
        }
    }

    private applySearch() {
        const filters = this.filters;
        for (const key in filters) {
            const filter = filters[key as Facet];
            if (!filter || filter.length === 0) {
                delete filters[key as Facet];
            }
        }
        this.router.navigate([this.config.get().routerPath + '/search'], {
            queryParams: {
                q: this.searchField.value || undefined,
                filters: Object.entries(filters).length > 0 ? JSON.stringify(filters) : undefined,
                pageIndex: undefined,
            },
            queryParamsHandling: 'merge',
        });
    }
}
