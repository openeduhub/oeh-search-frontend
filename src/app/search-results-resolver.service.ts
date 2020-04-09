import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Results, SearchService } from './search.service';

@Injectable({
    providedIn: 'root',
})
export class SearchResultsResolverService implements Resolve<Results> {
    constructor(private search: SearchService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<Results> {
        const searchString = route.queryParamMap.get('q');
        const pageInfo = {
            pageIndex: parseInt(route.queryParamMap.get('pageIndex'), 10) || 0,
            pageSize: parseInt(route.queryParamMap.get('pageSize'), 10) || 12,
        };
        const filters = JSON.parse(route.queryParamMap.get('filters') || '{}');
        return this.search.search(searchString, pageInfo, filters);
    }
}
