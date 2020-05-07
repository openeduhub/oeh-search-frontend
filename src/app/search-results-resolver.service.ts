import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { SearchService } from './search.service';
import { ResultFragment } from 'src/generated/graphql';
import { parseSearchQueryParams } from './utils';

@Injectable({
    providedIn: 'root',
})
export class SearchResultsResolverService implements Resolve<ResultFragment> {
    constructor(private search: SearchService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<ResultFragment> {
        const { searchString, pageIndex, pageSize, filters } = parseSearchQueryParams(
            route.queryParamMap,
        );
        return this.search.search(
            searchString,
            {
                pageIndex,
                pageSize,
            },
            filters,
        );
    }
}
