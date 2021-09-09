import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { SearchParametersService } from '../../core/search-parameters.service';
import { EduSharingService, SearchResults } from '../../core/edu-sharing.service';
import { SearchModule } from '../search.module';

@Injectable()
export class SearchPageResolverService implements Resolve<SearchResults> {
    constructor(
        private searchParameters: SearchParametersService,
        private eduSharing: EduSharingService,
    ) {}

    resolve(route: ActivatedRouteSnapshot): Observable<SearchResults> {
        this.searchParameters.update(route.paramMap, route.queryParamMap);
        return this.eduSharing.search();
    }
}
