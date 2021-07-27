import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Entry, SearchService } from '../search.service';

@Injectable({
    providedIn: 'root',
})
export class DetailsPageResolverService implements Resolve<Entry> {
    constructor(private search: SearchService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<Entry> {
        const id = route.paramMap.get('id');
        return this.search.getEntry(id);
    }
}
