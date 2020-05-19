import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
    AutoCompleteGQL,
    DidYouMeanSuggestionFragment,
    Facet,
    Facets,
    Filter,
    GetDetailsGQL,
    GetDetailsQuery,
    GetLargeThumbnailGQL,
    ResultFragment,
    SearchGQL,
} from '../generated/graphql';

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
                    this.didYouMeanSuggestion.next(response.data.didYouMeanSuggestion),
                ),
                tap((response) => this.facets.next(response.data.facets)),
                map((response) => response.data.search),
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

    private mapFilters(filters: Filters): Filter[] {
        if (!filters) {
            return [];
        }
        return Object.entries(filters)
            .filter(([key, value]) => value && value.length > 0)
            .map(([key, value]) => ({ field: key as Facet, terms: value }));
    }
}
