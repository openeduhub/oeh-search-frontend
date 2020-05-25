import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ParamMap, Resolve } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SearchGQL, SearchQuery } from '../generated/graphql';
import { mapFilters } from './search.service';
import { parseSearchQueryParams } from './utils';

type Type = 'LESSONPLANNING' | 'MATERIAL' | 'TOOL' | 'SOURCE';
type Hits = SearchQuery['search']['hits'];

interface SubjectsPortalResults {
    lessonPlanning: Hits;
    material: Hits;
    source: Hits;
    tool: Hits;
}

@Injectable({
    providedIn: 'root',
})
export class SubjectsPortalResolverService implements Resolve<SubjectsPortalResults> {
    private readonly size = 5;

    constructor(private searchGQL: SearchGQL) {}

    resolve(route: ActivatedRouteSnapshot): Observable<SubjectsPortalResults> {
        return forkJoin({
            lessonPlanning: this.getHitsForType('LESSONPLANNING', route.queryParamMap),
            material: this.getHitsForType('MATERIAL', route.queryParamMap),
            source: this.getHitsForType('SOURCE', route.queryParamMap),
            tool: this.getHitsForType('TOOL', route.queryParamMap),
        });
    }

    private getHitsForType(type: Type, queryParamMap: ParamMap): Observable<Hits> {
        const { searchString, filters } = parseSearchQueryParams(queryParamMap);
        filters.type = [type];
        filters['collection.uuid'] = ['FEATURED'];
        return this.searchGQL
            .fetch({
                searchString,
                size: this.size,
                filters: mapFilters(filters),
            })
            .pipe(map((response) => response.data.search.hits));
    }
}
