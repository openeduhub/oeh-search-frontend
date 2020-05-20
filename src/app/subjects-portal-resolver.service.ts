import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SubjectPortalsGQL, SubjectPortalsQuery } from '../generated/graphql';

@Injectable({
    providedIn: 'root',
})
export class SubjectsPortalResolverService implements Resolve<SubjectPortalsQuery> {
    constructor(private subjectPortalsGQL: SubjectPortalsGQL) {}

    resolve(route: ActivatedRouteSnapshot): Observable<SubjectPortalsQuery> {
        const educationalContext = route.paramMap.get('educationalContext');
        const discipline = route.paramMap.get('discipline');
        return this.subjectPortalsGQL
            .fetch({ discipline, educationalContext })
            .pipe(map((response) => response.data));
    }
}
