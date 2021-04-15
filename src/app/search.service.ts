import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import {
    Aggregation,
    AutoCompleteGQL,
    DidYouMeanSuggestionFragment,
    DidYouMeanSuggestionGQL,
    Facet,
    FacetGQL,
    FacetsGQL,
    FacetSuggestionsGQL,
    Filter,
    GetEntryGQL,
    GetEntryQuery,
    Language,
    ReportSearchRequestGQL,
    ResultFragment,
    SearchGQL,
    SimpleFilter,
} from '../generated/graphql';
import { ConfigService } from './config.service';
import { ParsedParams, SearchParametersService } from './search-parameters.service';

export type Filters = {
    [key in Facet]?: string[];
};

export type Facets = {
    [key in Facet]: Aggregation;
};

@Injectable({ providedIn: 'root' })
export class SearchService {
    private facets = new BehaviorSubject<Facets>(null);
    private didYouMeanSuggestion = new BehaviorSubject<DidYouMeanSuggestionFragment>(null);
    private lastSearchString: string;
    private lastFilters: Filters;
    private language: Language;
    /** Current filters, updated by params */
    // TODO: consider tracking other inputs like `searchString` in a similar way.
    private filters = new BehaviorSubject<Filter[] | null>(null);

    constructor(
        config: ConfigService,
        private autoCompleteGQL: AutoCompleteGQL,
        private didYouMeanSuggestionGQL: DidYouMeanSuggestionGQL,
        private facetGQL: FacetGQL,
        private facetsGQL: FacetsGQL,
        private facetSuggestionsGQL: FacetSuggestionsGQL,
        private getEntryGQL: GetEntryGQL,
        private searchGQL: SearchGQL,
        private searchParameters: SearchParametersService,
    ) {
        this.language = config.getLanguage();
        this.searchParameters
            .get()
            .pipe(filter((params) => params !== null))
            .subscribe(({ filters, oer }) => this.filters.next(mapFilters(filters, oer)));
    }

    search(): Observable<ResultFragment> {
        const {
            searchString,
            pageIndex,
            pageSize,
            filters,
        } = this.searchParameters.getCurrentValue();
        this.updateDidYouMeanSuggestion(searchString);
        this.updateFacets(searchString, filters);
        return this.searchGQL
            .fetch({
                searchString,
                from: pageIndex * pageSize,
                size: pageSize,
                filters: this.filters.value,
                language: this.language,
            })
            .pipe(map((response) => response.data.search));
    }

    getEntry(id: string): Observable<GetEntryQuery['get']> {
        return this.getEntryGQL
            .fetch({ id, language: this.language })
            .pipe(map((response) => response.data.get));
    }

    getLargeThumbnail(id: string): any {
        throw new Error('not implemented');
    }

    autoComplete(searchString: string): Observable<string[]> {
        if (searchString.length === 0) {
            return of(null);
        }
        const { filters, oer } = this.searchParameters.getCurrentValue();
        return this.autoCompleteGQL
            .fetch({ searchString, filters: mapFilters(filters, oer), language: this.language })
            .pipe(map((response) => response.data.autoComplete));
    }

    getFacets(): Observable<Facets> {
        return this.facets.asObservable();
    }

    getDidYouMeanSuggestion(): Observable<DidYouMeanSuggestionFragment> {
        return this.didYouMeanSuggestion.asObservable();
    }

    getFacetSuggestions(inputString: string): Observable<Facets> {
        const { searchString } = this.searchParameters.getCurrentValue();
        return this.facetSuggestionsGQL
            .fetch({
                inputString,
                searchString,
                language: this.language,
                filters: this.filters.value,
            })
            .pipe(map((response) => mapFacets(response.data.facetSuggestions)));
    }

    loadMoreFacetBuckets(facet: Facet, size: number) {
        const facets = { ...this.facets.getValue() };
        const { searchString } = this.searchParameters.getCurrentValue();
        this.facetGQL
            .fetch({
                size,
                searchString,
                filters: this.filters.value,
                language: this.language,
                facet,
            })
            .subscribe((response) => {
                facets[facet] = response.data.facet;
                this.facets.next(facets);
            });
    }

    private updateDidYouMeanSuggestion(searchString: string) {
        this.didYouMeanSuggestionGQL
            .fetch({ searchString, filters: this.filters.value, language: this.language })
            .subscribe((response) =>
                this.didYouMeanSuggestion.next(response.data.didYouMeanSuggestion),
            );
    }

    private updateFacets(searchString: string, filters: Filters) {
        const changedFilterFacets = this.getChangedFilterFacets(filters);
        this.facetsGQL
            .fetch({
                searchString,
                filters: this.filters.value,
                language: this.language,
            })
            .subscribe((response) => {
                const facets = mapFacets(response.data.facets);
                // If the only thing that changed since the last search is the terms list of a
                // single filter field, keep the facets of that field.
                //
                // These facets will not change when the above condition holds, but the user
                // might
                // have clicked the 'show more' button on the filter bar. In that case, we don't
                // want to reduce the number of options again while the user is interacting with
                // that filter.
                if (
                    // We need to have existing data for facets.
                    this.facets.getValue() &&
                    // All other search parameters have to be the same as before (currently only
                    // searchString).
                    searchString === this.lastSearchString &&
                    // Only a single filter must have changed.
                    changedFilterFacets.length === 1
                ) {
                    const changedFilterFacet = changedFilterFacets[0];
                    if (changedFilterFacet) {
                        facets[changedFilterFacet] = this.facets.getValue()[changedFilterFacet];
                    }
                }
                this.facets.next(facets);
            });
        this.lastSearchString = searchString;
        this.lastFilters = filters;
    }

    /**
     * Returns a list of filter fields that have changed since the last search.
     *
     * @param filters updated filters
     */
    private getChangedFilterFacets(filters: Filters): Facet[] {
        return Object.keys({ ...filters, ...this.lastFilters }).filter(
            (key): key is Facet => !arraysAreEqual(filters?.[key], this.lastFilters?.[key]),
        );
    }
}

export function mapFilters(filters: Filters, oer: ParsedParams['oer']): Filter[] | null {
    let result: Filter[] = [];
    if (filters) {
        result = Object.entries(filters)
            .filter(([key, value]) => value && value.length > 0)
            .map(([key, value]) => ({ facet: key as Facet, terms: value }));
    }
    if (oer === 'ALL') {
        result.push({ simpleFilter: SimpleFilter.Oer });
    }
    if (result.length > 0) {
        return result;
    } else {
        return null;
    }
}

export function mapFacets(aggregations: readonly Aggregation[]): Facets {
    return aggregations.reduce((acc, aggregation) => {
        acc[aggregation.facet] = aggregation;
        return acc;
    }, {} as Facets);
}

function arraysAreEqual<T>(lhs: T[], rhs: T[]): boolean {
    if (Array.isArray(lhs) && Array.isArray(rhs)) {
        return lhs.length === rhs.length && lhs.every((v, i) => rhs[i] === v);
    } else {
        return !lhs && !rhs;
    }
}
