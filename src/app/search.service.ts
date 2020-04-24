import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
    AutoCompleteGQL,
    Bucket,
    DidYouMeanSuggestionFragment,
    Facet,
    FacetFragment,
    Filter,
    GetDetailsGQL,
    GetDetailsQuery,
    GetLargeThumbnailGQL,
    ResultFragment,
    SearchGQL,
} from 'src/generated/graphql';

export interface Facets {
    [key: string]: { buckets: Bucket[] };
}

export type Details = GetDetailsQuery['get'];
export type Filters = {
    [key in Facet]?: string[];
};

@Injectable({ providedIn: 'root' })
export class SearchService {
    private facets = new BehaviorSubject<Facets>(null);
    private didYouMeanSuggestion = new BehaviorSubject<DidYouMeanSuggestionFragment>(null);

    constructor(
        private searchGQL: SearchGQL,
        private getDetailsGQL: GetDetailsGQL,
        private autoCompleteGQL: AutoCompleteGQL,
        private getLargeThumbnailGQL: GetLargeThumbnailGQL,
    ) {}

    search(
        searchString: string,
        pageInfo: {
            pageIndex: number;
            pageSize: number;
        },
        filters: Filters,
    ): Observable<ResultFragment> {
        return this.searchGQL
            .fetch({
                searchString: searchString || '',
                from: pageInfo.pageIndex * pageInfo.pageSize,
                size: pageInfo.pageSize,
                filters: this.mapFilters(filters),
            })
            .pipe(
                tap((response) =>
                    this.didYouMeanSuggestion.next(response.data.search.didYouMeanSuggestion),
                ),
                tap((response) => this.facets.next(this.mapFacets(response.data.search.facets))),
                map((response) => {
                    return {
                        took: response.data.search.took,
                        hits: response.data.search.hits,
                    };
                }),
            );
    }

    getDetails(id: string): Observable<GetDetailsQuery['get']> {
        return this.getDetailsGQL.fetch({ id }).pipe(map((response) => response.data.get));
    }

    getLargeThumbnail(id: string): Observable<string> {
        return this.getLargeThumbnailGQL
            .fetch({ id })
            .pipe(map((response) => response.data.get.thumbnail.large));
    }

    autoComplete(searchString: string, filters?: Filters): Observable<string[]> {
        if (searchString.length === 0) {
            return of(null);
        }
        return this.autoCompleteGQL
            .fetch({ searchString, filters: this.mapFilters(filters) })
            .pipe(map((response) => response.data.autoComplete));
    }

    getFacets(): Observable<Facets> {
        return this.facets.asObservable();
    }

    getDidYouMeanSuggestion(): Observable<DidYouMeanSuggestionFragment> {
        return this.didYouMeanSuggestion.asObservable();
    }

    private mapFacets(facets: FacetFragment[]): Facets {
        return facets.reduce((acc, facet) => {
            if (typeof facet === 'object') {
                acc[facet.facet as Facet] = { buckets: facet.buckets };
            }
            return acc;
        }, {} as Facets);
    }

    private mapFilters(filters: Filters): Filter[] {
        return Object.entries(filters)
            .filter(([key, value]) => value && value.length > 0)
            .map(([key, value]) => ({ field: key as Facet, terms: value }));
    }
}
