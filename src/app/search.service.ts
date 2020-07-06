import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Filter, Hit, Language, ResultFragment, SearchGQL } from '../generated/graphql';
import { ConfigService } from './config.service';
import { SearchParametersService } from './search-parameters.service';
import { assertUnreachable } from './utils';

// export type Details = GetDetailsQuery['get'];
export type Details = Hit;
// export type Facets = Omit<FacetsFragment, '__typename'>;

export interface Filters {
    [key: string]: string[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
    // private facets = new BehaviorSubject<Facets>(null);
    // private didYouMeanSuggestion = new BehaviorSubject<DidYouMeanSuggestionFragment>(null);
    private lastSearchString: string;
    private lastFilters: Filters;
    private language: Language;

    constructor(
        config: ConfigService,
        // private autoCompleteGQL: AutoCompleteGQL,
        // private didYouMeanSuggestionGQL: DidYouMeanSuggestionGQL,
        // private facetsGQL: FacetsGQL,
        // private getDetailsGQL: GetDetailsGQL,
        // private getLargeThumbnailGQL: GetLargeThumbnailGQL,
        // private loadMoreDisciplines: LoadMoreDisciplinesGQL,
        // private loadMoreEducationalContexts: LoadMoreEducationalContextsGQL,
        // private loadMoreIntendedEndUserRoles: LoadMoreIntendedEndUserRolesGQL,
        // private loadMoreKeywords: LoadMoreKeywordsGQL,
        // private loadMoreLearningResourceTypes: LoadMoreLearningResourceTypesGQL,
        // private loadMoreSources: LoadMoreSourcesGQL,
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
        // this.updateDidYouMeanSuggestion(searchString, filters);
        // this.updateFacets(searchString, filters);
        return this.searchGQL
            .fetch({
                searchString,
                from: pageIndex * pageSize,
                size: pageSize,
                // filters: mapFilters(filters),
                language: this.language,
            })
            .pipe(map((response) => response.data.search));
    }

    // getDetails(id: string): Observable<GetDetailsQuery['get']> {
    //     return this.getDetailsGQL.fetch({ id }).pipe(
    //         map((response) => response.data.get),
    //         tap((hit) => this.prepareHit(hit as Hit)),
    //     );
    // }
    getDetails(id: string): any {
        throw new Error('not implemented');
    }

    // getLargeThumbnail(id: string): Observable<string> {
    //     return this.getLargeThumbnailGQL
    //         .fetch({ id })
    //         .pipe(map((response) => response.data.get.thumbnail.large));
    // }
    getLargeThumbnail(id: string): any {
        throw new Error('not implemented');
    }

    // autoComplete(searchString: string, filters?: Filters): Observable<string[]> {
    //     if (searchString.length === 0) {
    //         return of(null);
    //     }
    //     return this.autoCompleteGQL
    //         .fetch({ searchString, filters: mapFilters(filters) })
    //         .pipe(map((response) => response.data.autoComplete));
    // }

    // getFacets(): Observable<Facets> {
    //     return this.facets.asObservable();
    // }

    // getDidYouMeanSuggestion(): Observable<DidYouMeanSuggestionFragment> {
    //     return this.didYouMeanSuggestion.asObservable();
    // }

    // loadMoreFacetBuckets(facet: keyof Facets, size: number) {
    //     const facets = { ...this.facets.getValue() };
    //     const { searchString, filters } = this.searchParameters.getCurrentValue();
    //     const fetchParams = {
    //         size,
    //         searchString,
    //         filters: mapFilters(filters),
    //         language: this.config.getShortLocale() as Language,
    //     };
    //     switch (facet) {
    //         case 'sources':
    //             this.loadMoreSources.fetch(fetchParams).subscribe((response) => {
    //                 facets.sources = response.data.facets.sources;
    //                 this.facets.next(facets);
    //             });
    //             break;
    //         case 'disciplines':
    //             this.loadMoreDisciplines.fetch(fetchParams).subscribe((response) => {
    //                 facets.disciplines = response.data.facets.disciplines;
    //                 this.facets.next(facets);
    //             });
    //             break;
    //         case 'keywords':
    //             this.loadMoreKeywords.fetch(fetchParams).subscribe((response) => {
    //                 facets.keywords = response.data.facets.keywords;
    //                 this.facets.next(facets);
    //             });
    //             break;
    //         case 'educationalContexts':
    //             this.loadMoreEducationalContexts.fetch(fetchParams).subscribe((response) => {
    //                 facets.educationalContexts = response.data.facets.educationalContexts;
    //                 this.facets.next(facets);
    //             });
    //             break;
    //         case 'learningResourceTypes':
    //             this.loadMoreLearningResourceTypes.fetch(fetchParams).subscribe((response) => {
    //                 facets.learningResourceTypes = response.data.facets.learningResourceTypes;
    //                 this.facets.next(facets);
    //             });
    //             break;
    //         case 'intendedEndUserRoles':
    //             this.loadMoreIntendedEndUserRoles.fetch(fetchParams).subscribe((response) => {
    //                 facets.intendedEndUserRoles = response.data.facets.intendedEndUserRoles;
    //                 this.facets.next(facets);
    //             });
    //             break;
    //         // Values for types are fixed. We don't have a load-more button here.
    //         case 'types':
    //             throw new Error('Cannot load more types');
    //         // Cause a compiler error when missing cases. Please add new cases above when that
    //         // happens.
    //         default:
    //             assertUnreachable(facet);
    //     }
    // }

    // private updateDidYouMeanSuggestion(searchString: string, filters: Filters) {
    //     this.didYouMeanSuggestionGQL
    //         .fetch({ searchString, filters: mapFilters(filters) })
    //         .subscribe((response) =>
    //             this.didYouMeanSuggestion.next(response.data.didYouMeanSuggestion),
    //         );
    // }

    // private updateFacets(searchString: string, filters: Filters) {
    //     const changedFilterFields = this.getChangedFilterFields(filters);
    //     this.facetsGQL
    //         .fetch({
    //             searchString,
    //             filters: mapFilters(filters),
    //             language: this.config.getShortLocale() as Language,
    //         })
    //         .subscribe((response) => {
    //             // If the only thing that changed since the last search is the terms list of a
    //             // single filter field, keep the facets of that field.
    //             //
    //             // These facets will not change when the above condition holds, but the user
    //             // might
    //             // have clicked the 'show more' button on the filter bar. In that case, we don't
    //             // want to reduce the number of options again while the user is interacting with
    //             // that filter.
    //             if (
    //                 // We need to have existing data for facets.
    //                 this.facets.getValue() &&
    //                 // All other search parameters have to be the same as before (currently only
    //                 // searchString).
    //                 searchString === this.lastSearchString &&
    //                 // Only a single filter must have changed.
    //                 changedFilterFields.length === 1
    //             ) {
    //                 const changedFilterField = changedFilterFields[0];
    //                 const changedFacet = Object.entries(response.data.facets).find(
    //                     ([key, value]) =>
    //                         typeof value === 'object' && value.field === changedFilterField,
    //                 )?.[0] as keyof Facets;
    //                 const facets = { ...response.data.facets };
    //                 if (changedFacet) {
    //                     facets[changedFacet] = this.facets.getValue()[changedFacet];
    //                 }
    //                 this.facets.next(facets);
    //             } else {
    //                 this.facets.next(response.data.facets);
    //             }
    //         });
    //     this.lastSearchString = searchString;
    //     this.lastFilters = filters;
    // }

    /**
     * Returns a list of filter fields that have changed since the last search.
     *
     * @param filters updated filters
     */
    private getChangedFilterFields(filters: Filters): string[] {
        return Object.keys({ ...filters, ...this.lastFilters }).filter(
            (key) => !arraysAreEqual(filters?.[key], this.lastFilters?.[key]),
        );
    }
}

// export function mapFilters(filters: Filters): Filter[] {
//     if (!filters) {
//         return [];
//     }
//     return Object.entries(filters)
//         .filter(([key, value]) => value && value.length > 0)
//         .map(([key, value]) => ({ field: key, terms: value }));
// }

function arraysAreEqual<T>(lhs: T[], rhs: T[]): boolean {
    if (Array.isArray(lhs) && Array.isArray(rhs)) {
        return lhs.length === rhs.length && lhs.every((v, i) => rhs[i] === v);
    } else {
        return !lhs && !rhs;
    }
}
