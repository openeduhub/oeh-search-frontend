import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    DidYouMeanSuggestion,
    Facets,
    Filters,
    Results,
    SearchResponse,
    Result,
} from 'shared/types';
import { BehaviorSubject, Observable, never } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class SearchService {
    private readonly url = environment.relayUrl;

    private facets = new BehaviorSubject<Facets>(null);
    private didYouMeanSuggestion = new BehaviorSubject<DidYouMeanSuggestion>(null);

    constructor(private http: HttpClient) {}

    search(
        searchString: string,
        pageInfo: {
            pageIndex: number;
            pageSize: number;
        },
        filters: Filters,
    ): Observable<Results> {
        return this.http
            .get<SearchResponse>(`${this.url}/api/v1/search`, {
                params: {
                    q: searchString || '',
                    pageIndex: pageInfo.pageIndex.toString(),
                    pageSize: pageInfo.pageSize.toString(),
                    filters: JSON.stringify(filters),
                },
            })
            .pipe(
                tap((response) => this.didYouMeanSuggestion.next(response.didYouMeanSuggestion)),
                tap((response) => this.facets.next(response.facets)),
                map((response) => response.searchResults),
            );
    }

    getDetails(id: string): Observable<Result> {
        return this.http.get<Result>(`${this.url}/api/v1/details/${id}`);
    }

    autoComplete(searchString: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.url}/api/v1/auto-complete`, {
            params: {
                q: searchString,
            },
        });
    }

    getFacets(): Observable<Facets> {
        return this.facets.asObservable();
    }

    getDidYouMeanSuggestion(): Observable<DidYouMeanSuggestion> {
        return this.didYouMeanSuggestion.asObservable();
    }
}
