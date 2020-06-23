import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ParamMap, Resolve } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResultFragment, SearchGQL, SearchQuery } from '../generated/graphql';
import { SearchParametersService } from './search-parameters.service';
import { Filters, mapFilters, SearchService } from './search.service';

export interface SearchData {
    searchResults: ResultFragment;
    subjectsPortalResults?: SubjectsPortalResults;
}

export type MediaType = 'LESSONPLANNING' | 'MATERIAL' | 'TOOL' | 'SOURCE';
export type Hits = SearchQuery['search']['hits'];

export interface SubjectsPortalResults {
    lessonPlanning: Hits;
    material: Hits;
    source: Hits;
    tool: Hits;
}

@Injectable({
    providedIn: 'root',
})
export class SearchResolverService implements Resolve<SearchData> {
    private readonly subjectsPortalNumberOfResults = 5;

    constructor(
        private search: SearchService,
        private searchGQL: SearchGQL,
        private searchParameters: SearchParametersService,
    ) {}

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
            lessonPlanning: this.getHitsForType('LESSONPLANNING'),
            material: this.getHitsForType('MATERIAL'),
            source: this.getHitsForType('SOURCE'),
            tool: this.getHitsForType('TOOL'),
        });
    }

    private getHitsForType(type: MediaType): Observable<Hits> {
        const { searchString, filters } = this.searchParameters.getCurrentValue();
        const filtersCopy: Filters = { ...filters };
        filtersCopy.type = [type];
        filtersCopy['collection.uuid'] = ['FEATURED'];
        return this.searchGQL
            .fetch({
                searchString,
                size: this.subjectsPortalNumberOfResults,
                filters: mapFilters(filtersCopy),
            })
            .pipe(map((response) => response.data.search.hits));
    }
}
