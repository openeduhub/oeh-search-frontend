import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FacetsDict } from 'ngx-edu-sharing-api';
import { combineLatest, Subject } from 'rxjs';
import { debounceTime, filter, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { ConfigService } from '../config.service';
import { EduSharingService, Facet, Filters } from '../edu-sharing.service';
import { facetProperties } from '../facet-properties';
import { SearchParametersService } from '../search-parameters.service';

type Suggestions = { [key in Facet]?: string[] };

@Component({
    selector: 'app-search-field',
    templateUrl: './search-field.component.html',
    styleUrls: ['./search-field.component.scss'],
    standalone: false,
})
export class SearchFieldComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild(CdkConnectedOverlay) overlay: CdkConnectedOverlay;
    @ViewChild(CdkOverlayOrigin) overlayOrigin: CdkOverlayOrigin;
    @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;
    @ViewChild('suggestionChip', { read: ElementRef })
    firstSuggestionChip?: ElementRef<HTMLElement>;

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
        'oehLrtAggregated',
        'educationalContext',
        'discipline',
        'keyword',
        'intendedEndUserRole',
        'source',
    ];

    searchField = new UntypedFormControl();
    filters: Filters = {};
    suggestions: Suggestions;
    showOverlay = false;
    hasSuggestions: boolean;

    private destroyed$: Subject<void> = new Subject();

    constructor(
        private cdr: ChangeDetectorRef,
        private config: ConfigService,
        private router: Router,
        private eduSharing: EduSharingService,
        private searchParameters: SearchParametersService,
    ) {}

    ngAfterViewInit(): void {
        // solves: "Expression has changed after it was checked."
        // related issue: https://stackoverflow.com/a/35243106
        this.searchField.setValue('');
        this.cdr.detectChanges();
    }

    ngOnInit(): void {
        this.searchParameters
            .get()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((searchParameters) => {
                const { searchString, filters } = searchParameters || {};
                this.searchField.setValue(searchString, { emitEvent: false });
                this.filters = filters ?? {};
                this.cdr.detectChanges();
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
        if (!(this.overlayOrigin.elementRef.nativeElement as HTMLElement).contains(clickTarget)) {
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

    focusOverlayIfOpen(event: Event): void {
        if (this.firstSuggestionChip) {
            this.firstSuggestionChip.nativeElement.focus();
            event.stopPropagation();
            event.preventDefault();
        }
    }

    onDetach(): void {
        const focusWasOnOverlay = this.overlay.overlayRef.overlayElement.contains(
            document.activeElement,
        );
        if (focusWasOnOverlay) {
            this.searchInput.nativeElement.focus();
        }
        // Update `showOverlay` if the user closed the overlay by hitting Esc, but leave it if it
        // was detached because we have no suggestions right now. In the latter case, we want to
        // show the overlay again as soon as suggestions become available.
        if (this.hasSuggestions) {
            this.showOverlay = false;
        }
    }

    addFilter(category: Facet, filter: string): void {
        const filtersCopy = this.filters[category]?.slice() ?? [];
        if (!filtersCopy.includes(filter)) {
            filtersCopy.push(filter);
            this.filters = { ...this.filters, [category]: filtersCopy };
            this.searchField.setValue('');
        }
        setTimeout(() => {
            this.searchInput.nativeElement.focus();
        });
        this.applySearch();
    }

    removeFilter(category: Facet, filter: string): void {
        const filtersCopy = this.filters[category].slice();
        const index = filtersCopy.indexOf(filter);
        if (index >= 0) {
            filtersCopy.splice(index, 1);
            this.filters = { ...this.filters, [category]: filtersCopy };
        }
        this.applySearch();
    }

    clear() {
        this.searchField.setValue('');
        this.onSubmit();
    }

    private updateSuggestions(facets: FacetsDict): void {
        if (!facets) {
            this.hasSuggestions = false;
            this.suggestions = {};
        } else {
            const suggestions: Suggestions = {};
            for (const category of this.categories) {
                const property = facetProperties[category];
                suggestions[category] = facets[property]?.values.map((bucket) => bucket.value);
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
