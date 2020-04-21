import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { SearchService } from './search.service';
import { ResultFragment } from 'src/generated/graphql';

@Injectable({
    providedIn: 'root',
})
export class SearchResultsResolverService implements Resolve<ResultFragment> {
    constructor(private search: SearchService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<ResultFragment> {
        const searchString = route.queryParamMap.get('q');
        const pageInfo = {
            pageIndex: parseInt(route.queryParamMap.get('pageIndex'), 10) || 0,
            pageSize: parseInt(route.queryParamMap.get('pageSize'), 10) || 12,
        };
        const filters = JSON.parse(route.queryParamMap.get('filters') || '{}');
        return this.search.search(searchString, pageInfo, filters);
    }
}
