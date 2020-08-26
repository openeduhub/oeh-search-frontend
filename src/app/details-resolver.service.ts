import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { SearchHitFragment } from '../generated/graphql';
import { SearchService } from './search.service';

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
