import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
    AutoCompleteGQL,
    DidYouMeanSuggestionFragment,
    DidYouMeanSuggestionGQL,
    FacetsFragment,
    FacetsGQL,
    Filter,
    GetDetailsGQL,
    GetDetailsQuery,
    GetLargeThumbnailGQL,
    Hit,
    Language,
    ResultFragment,
    SearchGQL,
} from '../generated/graphql';
import { ConfigService } from './config.service';

export type Details = GetDetailsQuery['get'];

export interface Filters {
    [key: string]: string[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
    private facets = new BehaviorSubject<FacetsFragment>(null);
    private didYouMeanSuggestion = new BehaviorSubject<DidYouMeanSuggestionFragment>(null);

    constructor(
        private searchGQL: SearchGQL,
        private facetsGQL: FacetsGQL,
        private didYouMeanSuggestionGQL: DidYouMeanSuggestionGQL,
        private getDetailsGQL: GetDetailsGQL,
        private autoCompleteGQL: AutoCompleteGQL,
        private getLargeThumbnailGQL: GetLargeThumbnailGQL,
        private config: ConfigService,
    ) {}

    search(
        searchString: string,
        pageInfo: {
            pageIndex: number;
            pageSize: number;
        },
        filters: Filters,
    ): Observable<ResultFragment> {
        this.didYouMeanSuggestionGQL
            .fetch({ searchString, filters: mapFilters(filters) })
            .subscribe((response) =>
                this.didYouMeanSuggestion.next(response.data.didYouMeanSuggestion),
            );
        this.facetsGQL
            .fetch({
                searchString,
                filters: mapFilters(filters),
                language: this.config.getShortLocale() as Language,
            })
            .subscribe((response) => this.facets.next(response.data.facets));
        return this.searchGQL
            .fetch({
                searchString,
                from: pageInfo.pageIndex * pageInfo.pageSize,
                size: pageInfo.pageSize,
                filters: mapFilters(filters),
            })
            .pipe(
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
            .fetch({ searchString, filters: mapFilters(filters) })
            .pipe(map((response) => response.data.autoComplete));
    }

    getFacets(): Observable<FacetsFragment> {
        return this.facets.asObservable();
    }

    getDidYouMeanSuggestion(): Observable<DidYouMeanSuggestionFragment> {
        return this.didYouMeanSuggestion.asObservable();
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
        if (!hit.lom.general.description && hit.lom.educational?.description) {
            hit.lom.general.description = hit.lom.educational.description;
        }
    }
}

export function mapFilters(filters: Filters): Filter[] {
    if (!filters) {
        return [];
    }
    return Object.entries(filters)
        .filter(([key, value]) => value && value.length > 0)
        .map(([key, value]) => ({ field: key, terms: value }));
}
