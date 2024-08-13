import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { SearchResults } from 'ngx-edu-sharing-api';
import { Observable } from 'rxjs';
import { EduSharingService } from '../../core/edu-sharing.service';
import { SearchParametersService } from '../../core/search-parameters.service';

@Injectable()
export class SearchPageResolverService {
    constructor(
        private searchParameters: SearchParametersService,
        private eduSharing: EduSharingService,
    ) {}

    resolve(route: ActivatedRouteSnapshot): Observable<SearchResults> {
        this.searchParameters.update(route.paramMap, route.queryParamMap);
        return this.eduSharing.search();
    }
}
