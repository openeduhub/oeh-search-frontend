import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { ResultFragment, SearchQuery } from '../generated/graphql';
import { SearchParametersService } from './search-parameters.service';
import { SearchService } from './search.service';

export type Hits = SearchQuery['search']['hits'];

export interface SubjectsPortalResults {
    method: Hits;
    lessonPlanning: Hits;
    content: Hits;
    portal: Hits;
    tool: Hits;
}

@Injectable({
    providedIn: 'root',
})
export class SearchResolverService implements Resolve<ResultFragment> {
    constructor(private search: SearchService, private searchParameters: SearchParametersService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<ResultFragment> {
        this.searchParameters.update(route.paramMap, route.queryParamMap);
        return this.search.search();
    }
}
