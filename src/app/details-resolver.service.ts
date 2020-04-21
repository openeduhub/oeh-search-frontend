import { Injectable } from '@angular/core';
import { SearchService, Details } from './search.service';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DetailsResolverService implements Resolve<Details> {
    constructor(private search: SearchService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<Details> {
        const id = route.paramMap.get('id');
        return this.search.getDetails(id);
    }
}
