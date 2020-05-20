import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
    AutoCompleteGQL,
    DidYouMeanSuggestionFragment,
    Facets,
    Filter,
    GetDetailsGQL,
    GetDetailsQuery,
    GetLargeThumbnailGQL,
    Hit,
    ResultFragment,
    SearchGQL,
} from '../generated/graphql';

export type Details = GetDetailsQuery['get'];

export interface Filters {
    [key: string]: string[];
}

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
        // Currently, this fetches results, suggestions, and facets for every
        // query. Alas, the in-memory cache is not able to cache parts of the
        // query. There are some possibilities to improve this with some
        // tradeoffs:
        //   1. We could send separate queries for the three parts.
        //        This would allow the in-memory cache to keep facets and
        //      suggestions when browsing result pages. However, we would have
        //      three separate network requests for each initial query.
        //   2. We could use a different query and only update results when
        //      another page of an otherwise identical query is requested.
        //        This would require to keep track of the previous query and
        //      effectively compare any new query against it. We would miss
        //      cache opportunities when the user navigates back to an already
        //      made query, but have less overhead for scrolling pages.
        //   3. We could omit fetching facets when the filterbar is not shown.
        //        This would make a second request necessary when it *is* shown,
        //      but omit the effort entirely as long as it is hidden. We would
        //      just need to keep track of the current search query.
        return this.searchGQL
            .fetch({
                searchString: searchString || '',
                from: pageInfo.pageIndex * pageInfo.pageSize,
                size: pageInfo.pageSize,
                filters: this.mapFilters(filters),
            })
            .pipe(
                tap((response) =>
                    this.didYouMeanSuggestion.next(response.data.didYouMeanSuggestion),
                ),
                tap((response) => this.facets.next(response.data.facets)),
                map((response) => response.data.search),
                tap((searchResult) => this.prepareSearchResult(searchResult)),
            );
    }

    getDetails(id: string): Observable<GetDetailsQuery['get']> {
        return this.getDetailsGQL.fetch({ id }).pipe(
            map((response) => response.data.get),
            tap((hit) => this.prepareHit(hit as Hit)),
        );
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

    private mapFilters(filters: Filters): Filter[] {
        if (!filters) {
            return [];
        }
        return Object.entries(filters)
            .filter(([key, value]) => value && value.length > 0)
            .map(([key, value]) => ({ field: key, terms: value }));
    }

    /**
     * Temporary mapping until everything is updated.
     */
    private prepareSearchResult(searchResult: ResultFragment) {
        for (const hit of searchResult.hits.hits) {
            this.prepareHit(hit as Hit);
        }
    }

    /**
     * Temporary mapping until everything is updated.
     */
    private prepareHit(hit: Hit) {
        if (!hit.lom.general.description) {
            hit.lom.general.description = hit.lom.educational.description;
        } else {
            console.log(hit.lom.general.description);
        }
    }
}
