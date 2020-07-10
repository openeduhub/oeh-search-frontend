import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ParamMap, Resolve } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    EditorialTag,
    Facet,
    ResultFragment,
    SearchGQL,
    SearchQuery,
    Type,
    Language,
} from '../generated/graphql';
import { SearchParametersService } from './search-parameters.service';
import { Filters, mapFilters, SearchService } from './search.service';
import { ConfigService } from './config.service';

export interface SearchData {
    searchResults: ResultFragment;
    subjectsPortalResults?: SubjectsPortalResults;
}

export type Hits = SearchQuery['search']['hits'];

export interface SubjectsPortalResults {
    lessonPlanning: Hits;
    content: Hits;
    portal: Hits;
    tool: Hits;
}

@Injectable({
    providedIn: 'root',
})
export class SearchResolverService implements Resolve<SearchData> {
    private readonly subjectsPortalNumberOfResults = 5;
    private language: Language;

    constructor(
        config: ConfigService,
        private search: SearchService,
        private searchGQL: SearchGQL,
        private searchParameters: SearchParametersService,
    ) {
        this.language = config.getLanguage();
    }

    resolve(route: ActivatedRouteSnapshot): Observable<SearchData> {
        this.searchParameters.update(route.paramMap, route.queryParamMap);
        const observables: { [key in keyof SearchData]: Observable<SearchData[key]> } = {
            searchResults: this.resolveSearchResults(),
        };
        if (this.shouldLoadSubjectsPortal(route.paramMap)) {
            observables.subjectsPortalResults = this.resolveSubjectsPortalResults();
        }
        return forkJoin(observables);
    }

    private resolveSearchResults(): Observable<ResultFragment> {
        return this.search.search();
    }

    private shouldLoadSubjectsPortal(paramMap: ParamMap): boolean {
        return paramMap.has('educationalContext') && paramMap.has('discipline');
    }

    private resolveSubjectsPortalResults(): Observable<SubjectsPortalResults> {
        return forkJoin({
            lessonPlanning: this.getHitsForType(Type.LessonPlanning),
            content: this.getHitsForType(Type.Content),
            portal: this.getHitsForType(Type.Portal),
            tool: this.getHitsForType(Type.Tool),
        });
    }

    private getHitsForType(type: Type): Observable<Hits> {
        const { searchString, filters } = this.searchParameters.getCurrentValue();
        const filtersCopy: Filters = { ...filters };
        filtersCopy[Facet.Type] = [type];
        filtersCopy[Facet.EditorialTag] = [EditorialTag.Recommended];
        return this.searchGQL
            .fetch({
                searchString,
                size: this.subjectsPortalNumberOfResults,
                filters: mapFilters(filtersCopy),
                language: this.language,
            })
            .pipe(map((response) => response.data.search.hits));
    }
}
