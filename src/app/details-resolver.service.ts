import { Injectable } from '@angular/core';
import { Result, SearchService } from './search.service';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DetailsResolverService implements Resolve<Result> {
    constructor(private search: SearchService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<Result> {
        const id = route.paramMap.get('id');
        return this.search.getDetails(id);
    }
}
