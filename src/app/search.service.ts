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
    LoadMoreDisciplinesGQL,
    LoadMoreEducationalContextsGQL,
    LoadMoreIntendedEndUserRolesGQL,
    LoadMoreKeywordsGQL,
    LoadMoreLearningResourceTypesGQL,
    LoadMoreSourcesGQL,
    ResultFragment,
    SearchGQL,
} from '../generated/graphql';
import { ConfigService } from './config.service';
import { SearchParametersService } from './search-parameters.service';
import { assertUnreachable } from './utils';

export type Details = GetDetailsQuery['get'];
export type Facets = Omit<FacetsFragment, '__typename'>;

export interface Filters {
    [key: string]: string[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
    private facets = new BehaviorSubject<Facets>(null);
    private didYouMeanSuggestion = new BehaviorSubject<DidYouMeanSuggestionFragment>(null);

    constructor(
        private autoCompleteGQL: AutoCompleteGQL,
        private config: ConfigService,
        private didYouMeanSuggestionGQL: DidYouMeanSuggestionGQL,
        private facetsGQL: FacetsGQL,
        private getDetailsGQL: GetDetailsGQL,
        private getLargeThumbnailGQL: GetLargeThumbnailGQL,
        private loadMoreDisciplines: LoadMoreDisciplinesGQL,
        private loadMoreEducationalContexts: LoadMoreEducationalContextsGQL,
        private loadMoreIntendedEndUserRoles: LoadMoreIntendedEndUserRolesGQL,
        private loadMoreKeywords: LoadMoreKeywordsGQL,
        private loadMoreLearningResourceTypes: LoadMoreLearningResourceTypesGQL,
        private loadMoreSources: LoadMoreSourcesGQL,
        private searchGQL: SearchGQL,
        private searchParameters: SearchParametersService,
    ) {}

    search(): Observable<ResultFragment> {
        const {
            searchString,
            pageIndex,
            pageSize,
            filters,
        } = this.searchParameters.getCurrentValue();
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
                from: pageIndex * pageSize,
                size: pageSize,
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

    getFacets(): Observable<Facets> {
        return this.facets.asObservable();
    }

    getDidYouMeanSuggestion(): Observable<DidYouMeanSuggestionFragment> {
        return this.didYouMeanSuggestion.asObservable();
    }

    loadMoreFacetBuckets(facet: keyof Facets, size: number) {
        const facets = { ...this.facets.getValue() };
        const { searchString, filters } = this.searchParameters.getCurrentValue();
        const fetchParams = {
            size,
            searchString,
            filters: mapFilters(filters),
            language: this.config.getShortLocale() as Language,
        };
        switch (facet) {
            case 'sources':
                this.loadMoreSources.fetch(fetchParams).subscribe((response) => {
                    facets.sources = response.data.facets.sources;
                    this.facets.next(facets);
                });
                break;
            case 'disciplines':
                this.loadMoreDisciplines.fetch(fetchParams).subscribe((response) => {
                    facets.disciplines = response.data.facets.disciplines;
                    this.facets.next(facets);
                });
                break;
            case 'keywords':
                this.loadMoreKeywords.fetch(fetchParams).subscribe((response) => {
                    facets.keywords = response.data.facets.keywords;
                    this.facets.next(facets);
                });
                break;
            case 'educationalContexts':
                this.loadMoreEducationalContexts.fetch(fetchParams).subscribe((response) => {
                    facets.educationalContexts = response.data.facets.educationalContexts;
                    this.facets.next(facets);
                });
                break;
            case 'learningResourceTypes':
                this.loadMoreLearningResourceTypes.fetch(fetchParams).subscribe((response) => {
                    facets.learningResourceTypes = response.data.facets.learningResourceTypes;
                    this.facets.next(facets);
                });
                break;
            case 'intendedEndUserRoles':
                this.loadMoreIntendedEndUserRoles.fetch(fetchParams).subscribe((response) => {
                    facets.intendedEndUserRoles = response.data.facets.intendedEndUserRoles;
                    this.facets.next(facets);
                });
                break;
            // Values for types are fixed. We don't have a load-more button here.
            case 'types':
                throw new Error('Cannot load more types');
            // Cause a compiler error when missing cases. Please add new cases above when that
            // happens.
            default:
                assertUnreachable(facet);
        }
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
