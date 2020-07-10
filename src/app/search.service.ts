import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    Aggregation,
    AutoCompleteGQL,
    DidYouMeanSuggestionFragment,
    DidYouMeanSuggestionGQL,
    Facet,
    FacetGQL,
    FacetsGQL,
    Filter,
    GetEntryGQL,
    GetEntryQuery,
    Language,
    ResultFragment,
    SearchGQL,
} from '../generated/graphql';
import { ConfigService } from './config.service';
import { SearchParametersService } from './search-parameters.service';

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

    constructor(
        config: ConfigService,
        private autoCompleteGQL: AutoCompleteGQL,
        private didYouMeanSuggestionGQL: DidYouMeanSuggestionGQL,
        private facetGQL: FacetGQL,
        private facetsGQL: FacetsGQL,
        private getEntryGQL: GetEntryGQL,
        private searchGQL: SearchGQL,
        private searchParameters: SearchParametersService,
    ) {
        this.language = config.getLanguage();
    }

    search(): Observable<ResultFragment> {
        const {
            searchString,
            pageIndex,
            pageSize,
            filters,
        } = this.searchParameters.getCurrentValue();
        this.updateDidYouMeanSuggestion(searchString, filters);
        this.updateFacets(searchString, filters);
        return this.searchGQL
            .fetch({
                searchString,
                from: pageIndex * pageSize,
                size: pageSize,
                filters: mapFilters(filters),
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

    autoComplete(searchString: string, filters?: Filters): Observable<string[]> {
        if (searchString.length === 0) {
            return of(null);
        }
        return this.autoCompleteGQL
            .fetch({ searchString, filters: mapFilters(filters), language: this.language })
            .pipe(map((response) => response.data.autoComplete));
    }

    getFacets(): Observable<Facets> {
        return this.facets.asObservable();
    }

    getDidYouMeanSuggestion(): Observable<DidYouMeanSuggestionFragment> {
        return this.didYouMeanSuggestion.asObservable();
    }

    loadMoreFacetBuckets(facet: Facet, size: number) {
        const facets = { ...this.facets.getValue() };
        const { searchString, filters } = this.searchParameters.getCurrentValue();
        this.facetGQL
            .fetch({
                size,
                searchString,
                filters: mapFilters(filters),
                language: this.language,
                facet,
            })
            .subscribe((response) => {
                facets[facet] = response.data.facet;
                this.facets.next(facets);
            });
    }

    private updateDidYouMeanSuggestion(searchString: string, filters: Filters) {
        this.didYouMeanSuggestionGQL
            .fetch({ searchString, filters: mapFilters(filters), language: this.language })
            .subscribe((response) =>
                this.didYouMeanSuggestion.next(response.data.didYouMeanSuggestion),
            );
    }

    private updateFacets(searchString: string, filters: Filters) {
        const changedFilterFacets = this.getChangedFilterFacets(filters);
        this.facetsGQL
            .fetch({
                searchString,
                filters: mapFilters(filters),
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

export function mapFilters(filters: Filters): Filter[] | null {
    if (!filters) {
        return null;
    }
    return Object.entries(filters)
        .filter(([key, value]) => value && value.length > 0)
        .map(([key, value]) => ({ facet: key as Facet, terms: value }));
}

function mapFacets(aggregations: readonly Aggregation[]): Facets {
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
