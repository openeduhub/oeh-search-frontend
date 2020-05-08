import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { SubjectPortalsGQL, SubjectPortalsQuery } from 'src/generated/graphql';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SubjectsPortalResolverService implements Resolve<SubjectPortalsQuery> {
    constructor(private subjectPortalsGQL: SubjectPortalsGQL) {}

    resolve(route: ActivatedRouteSnapshot): Observable<SubjectPortalsQuery> {
        const discipline = route.paramMap.get('discipline');
        return this.subjectPortalsGQL.fetch({ discipline }).pipe(map((response) => response.data));
    }
}
