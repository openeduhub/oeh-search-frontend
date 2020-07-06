import { Injectable } from '@angular/core';
import { SearchService, Details } from './search.service';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SearchHitFragment } from '../generated/graphql';

@Injectable({
    providedIn: 'root',
})
export class DetailsResolverService implements Resolve<SearchHitFragment> {
    constructor(private search: SearchService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<SearchHitFragment> {
        const id = route.paramMap.get('id');
        return this.search.getEntry(id);
    }
}
