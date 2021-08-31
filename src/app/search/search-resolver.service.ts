import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { EduSharingService, SearchResults } from '../edu-sharing/edu-sharing.service';
import { SearchParametersService } from '../search-parameters.service';

@Injectable({
    providedIn: 'root',
})
export class SearchResolverService implements Resolve<SearchResults> {
    constructor(
        private searchParameters: SearchParametersService,
        private eduSharing: EduSharingService,
    ) {}

    resolve(route: ActivatedRouteSnapshot): Observable<SearchResults> {
        this.searchParameters.update(route.paramMap, route.queryParamMap);
        return this.eduSharing.search();
    }
}
